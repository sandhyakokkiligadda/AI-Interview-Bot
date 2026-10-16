import { useState, useEffect, useRef, useCallback } from 'react';
import { SupportedLanguage } from '../types';

const LANGUAGE_CODES: Record<SupportedLanguage, string> = {
  English: 'en-IN',
  Telugu: 'te-IN',
  Hindi: 'hi-IN',
  Tamil: 'ta-IN',
  Kannada: 'kn-IN',
  Malayalam: 'ml-IN'
};

// Global declarations for webkit speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseSpeechRecognitionProps {
  language: SupportedLanguage;
  onTranscriptUpdate?: (fullTranscript: string) => void;
  onError?: (errorMsg: string) => void;
}

export function useSpeechRecognition({
  language,
  onTranscriptUpdate,
  onError
}: UseSpeechRecognitionProps) {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const isListeningRef = useRef<boolean>(false);
  const onTranscriptUpdateRef = useRef(onTranscriptUpdate);
  onTranscriptUpdateRef.current = onTranscriptUpdate;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = LANGUAGE_CODES[language] || 'en-IN';

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        setPermissionError(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            currentFinal += item[0].transcript + ' ';
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (currentFinal) {
          setTranscript((prev) => {
            const updated = (prev ? prev + ' ' : '') + currentFinal.trim();
            onTranscriptUpdateRef.current?.(updated);
            return updated;
          });
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // Normal silence; do not abort. onend will handle keeping it alive if candidate is still recording.
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          isListeningRef.current = false;
          setIsListening(false);
          const msg =
            'Microphone permission was denied. Please allow microphone access in your browser or type your answer below.';
          setPermissionError(msg);
          onErrorRef.current?.(msg);
        } else if (event.error !== 'aborted') {
          console.warn('Speech recognition notice:', event.error);
        }
      };

      recognition.onend = () => {
        // If the candidate didn't explicitly stop, auto-restart to prevent Chrome's silence auto-cutoff
        if (isListeningRef.current) {
          try {
            recognition.start();
            return;
          } catch (e) {
            // Already started or restarting
          }
        }
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      stopAudioAnalyser();
    };
  }, [language]);

  // Audio volume analyzer via Web Audio API for animated waveforms
  const startAudioAnalyser = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const sample = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(1.0, avg / 128.0);
        setAudioVolume(normalized);
        animFrameRef.current = requestAnimationFrame(sample);
      };
      animFrameRef.current = requestAnimationFrame(sample);
    } catch (err) {
      console.warn('Microphone stream analyzer not accessible:', err);
    }
  };

  const stopAudioAnalyser = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    setAudioVolume(0);
  };

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      onErrorRef.current?.('Speech recognition is not supported in this browser. Please use text typing mode.');
      return;
    }

    try {
      setPermissionError(null);
      isListeningRef.current = true;
      recognitionRef.current.lang = LANGUAGE_CODES[language] || 'en-IN';
      recognitionRef.current.start();
      await startAudioAnalyser();
    } catch (err: any) {
      console.warn('Recognition start exception:', err);
    }
  }, [language]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    stopAudioAnalyser();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    setTranscript,
    interimTranscript,
    audioVolume,
    permissionError,
    startListening,
    stopListening,
    resetTranscript
  };
}
