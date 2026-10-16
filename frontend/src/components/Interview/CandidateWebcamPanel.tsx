import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  ShieldCheck,
  User,
  Volume2
} from 'lucide-react';

interface CandidateWebcamPanelProps {
  stream: MediaStream | null;
  candidateName: string;
  violationsCount: number;
  isListening?: boolean;
}

export const CandidateWebcamPanel: React.FC<CandidateWebcamPanelProps> = ({
  stream,
  candidateName,
  violationsCount,
  isListening
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;

      // Audio volume analyzer
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const loop = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setVolumeLevel(Math.min(1.0, avg / 120.0));
          animFrameRef.current = requestAnimationFrame(loop);
        };
        animFrameRef.current = requestAnimationFrame(loop);
      } catch (err) {
        console.warn('Audio meter exception:', err);
      }
    }

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
  }, [stream]);

  const toggleCamera = () => {
    if (stream) {
      const vTrack = stream.getVideoTracks()[0];
      if (vTrack) {
        vTrack.enabled = !vTrack.enabled;
        setIsCameraOn(vTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (stream) {
      const aTrack = stream.getAudioTracks()[0];
      if (aTrack) {
        aTrack.enabled = !aTrack.enabled;
        setIsMicOn(aTrack.enabled);
      }
    }
  };

  return (
    <div className="w-full rounded-2xl glass-panel p-4 flex flex-col gap-3 shadow-xl border border-slate-800">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-teal-400" />
          <span className="font-semibold text-slate-200">{candidateName}</span>
          <span className="text-[10px] text-slate-400">(Candidate Live Stream)</span>
        </div>

        {/* Proctoring Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-slate-300 font-medium">Proctoring</span>
          {violationsCount > 0 ? (
            <span className="text-rose-400 font-bold ml-1 font-mono">
              ({violationsCount}/5 Strikes)
            </span>
          ) : (
            <span className="text-emerald-400 font-mono ml-0.5">Secure</span>
          )}
        </div>
      </div>


      {/* Live Video Window */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
        {stream && isCameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
            <CameraOff className="w-8 h-8 opacity-40 text-slate-400" />
            <span>Camera Disabled</span>
          </div>
        )}

        {/* Live Audio Activity Overlay Indicator */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700 text-[10px]">
          <Volume2 className="w-3 h-3 text-teal-400" />
          <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-teal-400 transition-all duration-75 rounded-full"
              style={{ width: `${Math.min(100, Math.max(8, volumeLevel * 100))}%` }}
            />
          </div>
        </div>

        {/* Controls Overlay (Mute / Cam) */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2">
          <button
            onClick={toggleCamera}
            className={`p-1.5 rounded-lg border text-xs transition ${
              isCameraOn
                ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-rose-950/80 text-rose-300 border-rose-700'
            }`}
            title={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
          >
            {isCameraOn ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={toggleMic}
            className={`p-1.5 rounded-lg border text-xs transition ${
              isMicOn
                ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                : 'bg-rose-950/80 text-rose-300 border-rose-700'
            }`}
            title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
          >
            {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
