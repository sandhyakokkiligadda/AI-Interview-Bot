import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle2,
  X
} from 'lucide-react';

interface CameraCheckModalProps {
  onConfirm: (stream: MediaStream | null) => void;
  onCancel: () => void;
  candidateName: string;
  jobRole: string;
}

export const CameraCheckModal: React.FC<CameraCheckModalProps> = ({
  onConfirm,
  onCancel,
  candidateName,
  jobRole
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [hasMic, setHasMic] = useState<boolean>(false);
  const [isRequesting, setIsRequesting] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let localStream: MediaStream | null = null;

    const requestDevices = async () => {
      try {
        setIsRequesting(true);
        setErrorMsg(null);
        localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: true
        });

        setStream(localStream);
        setHasCamera(localStream.getVideoTracks().length > 0);
        setHasMic(localStream.getAudioTracks().length > 0);

        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
        }

        // Setup audio level analyser
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;
        const source = audioCtx.createMediaStreamSource(localStream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(1.0, avg / 100));
          animFrameRef.current = requestAnimationFrame(checkVolume);
        };
        animFrameRef.current = requestAnimationFrame(checkVolume);
      } catch (err: any) {
        console.warn('Device permission notice:', err);
        setErrorMsg(
          'Camera or microphone access was not granted. You can still proceed in text-only mode with Eilik.'
        );
      } finally {
        setIsRequesting(false);
      }
    };

    requestDevices();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          audioContextRef.current.close();
        } catch {}
      }
    };
  }, []);

  const handleProceed = () => {
    onConfirm(stream);
  };

  const handleSkipCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    onConfirm(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-2xl w-full rounded-3xl bg-slate-900 border border-teal-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
              <Camera className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                Live Camera & Microphone Check
              </h2>
              <p className="text-xs text-slate-400">
                Role: <span className="text-teal-300 font-semibold">{jobRole}</span> • Candidate:{' '}
                <span className="text-slate-200">{candidateName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Webcam Preview Box */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
          <div className="sm:col-span-7 relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center shadow-inner">
            {isRequesting ? (
              <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                <span>Accessing webcam & microphone...</span>
              </div>
            ) : hasCamera ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500 p-4 text-center text-xs">
                <CameraOff className="w-8 h-8 opacity-40" />
                <span>Webcam feed not available. You can continue in text answer mode.</span>
              </div>
            )}

            {/* Overlaid Status Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-medium border border-slate-700/60">
              <span className={`w-2 h-2 rounded-full ${hasCamera ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span className="text-slate-200">{hasCamera ? 'Camera Active' : 'No Camera'}</span>
            </div>
          </div>

          {/* Device Indicators & Guidelines */}
          <div className="sm:col-span-5 space-y-3.5 text-xs">
            {/* Microphone test meter */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-teal-400" /> Mic Volume Test
                </span>
                <span className="text-[10px] text-teal-400 font-mono">
                  {hasMic ? 'Working' : 'Not detected'}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-100 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(10, audioLevel * 100))}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500">Speak into your mic to test volume</p>
            </div>

            {/* Anti-cheating proctoring summary */}
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-slate-300 space-y-1.5">
              <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Proctoring Rules (5-Strike Policy)
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4 leading-relaxed">
                <li>Remain in the interview tab at all times.</li>
                <li>Switching away triggers strike warnings (5th terminates session).</li>
                <li>Eilik waits patiently—never rushes you.</li>
              </ul>
            </div>
          </div>
        </div>


        {errorMsg && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={handleSkipCamera}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            Continue Without Camera
          </button>

          <button
            onClick={handleProceed}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-semibold text-xs sm:text-sm transition shadow-lg shadow-teal-950/50 flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Enter Proctored Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
