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

const API_BASE_URL = 'http://localhost:8005/api';

interface UseSpeechSynthesisProps {
  language: SupportedLanguage;
  voiceSpeed?: number;
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
  onSpeakingTick?: (visemeIntensity: number) => void;
}

export function useSpeechSynthesis({
  language,
  voiceSpeed = 1.0,
  onSpeakingStart,
  onSpeakingEnd,
  onSpeakingTick
}: UseSpeechSynthesisProps) {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const animFrameRef = useRef<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const keepAliveIntervalRef = useRef<any>(null);

  const onSpeakingStartRef = useRef(onSpeakingStart);
  onSpeakingStartRef.current = onSpeakingStart;

  const onSpeakingEndRef = useRef(onSpeakingEnd);
  onSpeakingEndRef.current = onSpeakingEnd;

  const onSpeakingTickRef = useRef(onSpeakingTick);
  onSpeakingTickRef.current = onSpeakingTick;

  const voiceSpeedRef = useRef(voiceSpeed);
  voiceSpeedRef.current = voiceSpeed;

  const languageRef = useRef(language);
  languageRef.current = language;

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return;
        setAvailableVoices(voices);

        // Prioritize natural female voices matching Fliki sample
        const targetLangCode = LANGUAGE_CODES[language] || 'en-IN';
        const femaleKeywords = ['jenny', 'aria', 'zira', 'samantha', 'victoria', 'female', 'natural'];
        
        const matched =
          voices.find(
            (v) =>
              v.lang.toLowerCase().startsWith('en') &&
              femaleKeywords.some((k) => v.name.toLowerCase().includes(k))
          ) ||
          voices.find((v) => v.lang.toLowerCase() === targetLangCode.toLowerCase()) ||
          voices.find((v) => v.lang.toLowerCase().startsWith(targetLangCode.split('-')[0])) ||
          voices[0] ||
          null;

        setSelectedVoice(matched);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [language]);

  // Simulated mouth movement ticker while speaking
  const startVisemeLoop = useCallback(() => {
    let phase = 0;
    const tick = () => {
      phase += 0.25;
      const intensity = Math.abs(Math.sin(phase) * 0.7 + Math.cos(phase * 1.8) * 0.3);
      onSpeakingTickRef.current?.(intensity);
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  const stopVisemeLoop = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    onSpeakingTickRef.current?.(0);
  }, []);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
  }, []);

  // Browser Web Speech API fallback
  const speakBrowserFallback = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      try {
        window.speechSynthesis.cancel();
      } catch {}

      if (window.speechSynthesis.paused) {
        try {
          window.speechSynthesis.resume();
        } catch {}
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      (window as any).__activeSpeechUtterance = utterance;

      const currentLang = languageRef.current;
      const targetLangCode = LANGUAGE_CODES[currentLang] || 'en-IN';
      utterance.lang = targetLangCode;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = Math.max(0.7, Math.min(voiceSpeedRef.current * 0.96, 1.25));
      utterance.pitch = 1.05; // Fliki tone profile

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        startVisemeLoop();
        onSpeakingStartRef.current?.();

        stopKeepAlive();
        keepAliveIntervalRef.current = setInterval(() => {
          if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 10000);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        stopVisemeLoop();
        stopKeepAlive();
        (window as any).__activeSpeechUtterance = null;
        onSpeakingEndRef.current?.();
      };

      utterance.onerror = (e) => {
        setIsSpeaking(false);
        setIsPaused(false);
        stopVisemeLoop();
        stopKeepAlive();
        (window as any).__activeSpeechUtterance = null;
        onSpeakingEndRef.current?.();
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('window.speechSynthesis.speak error:', err);
      }
    },
    [selectedVoice, startVisemeLoop, stopVisemeLoop, stopKeepAlive]
  );

  const speak = useCallback(
    (text: string) => {
      if (!text || text.trim() === '') return;

      // 1. Stop any currently playing audio or speech
      if (audioElementRef.current) {
        try {
          audioElementRef.current.pause();
          audioElementRef.current.src = '';
        } catch {}
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }
      stopVisemeLoop();
      stopKeepAlive();

      // 2. Attempt Fliki Neural TTS stream from backend
      const currentLang = languageRef.current;
      const ttsUrl = `${API_BASE_URL}/tts?text=${encodeURIComponent(text)}&language=${encodeURIComponent(currentLang)}`;

      const audio = new Audio();
      audioElementRef.current = audio;
      audio.playbackRate = Math.max(0.7, Math.min(voiceSpeedRef.current, 1.25));

      audio.onplay = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        startVisemeLoop();
        onSpeakingStartRef.current?.();
      };

      audio.onended = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        stopVisemeLoop();
        audioElementRef.current = null;
        onSpeakingEndRef.current?.();
      };

      audio.onerror = () => {
        console.warn('Backend Fliki TTS stream unavailable, falling back to browser speech synthesis.');
        audioElementRef.current = null;
        speakBrowserFallback(text);
      };

      audio.src = ttsUrl;
      audio.play().catch((err) => {
        console.warn('Audio play auto-policy warning:', err);
        speakBrowserFallback(text);
      });
    },
    [startVisemeLoop, stopVisemeLoop, stopKeepAlive, speakBrowserFallback]
  );

  const pause = useCallback(() => {
    if (audioElementRef.current && !audioElementRef.current.paused) {
      audioElementRef.current.pause();
      setIsPaused(true);
      stopVisemeLoop();
    } else if (window.speechSynthesis && isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      stopVisemeLoop();
    }
  }, [isSpeaking, isPaused, stopVisemeLoop]);

  const resume = useCallback(() => {
    if (audioElementRef.current && isPaused) {
      audioElementRef.current.play();
      setIsPaused(false);
      startVisemeLoop();
    } else if (window.speechSynthesis && isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      startVisemeLoop();
    }
  }, [isSpeaking, isPaused, startVisemeLoop]);

  const stop = useCallback(() => {
    if (audioElementRef.current) {
      try {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      } catch {}
      audioElementRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    stopKeepAlive();
    setIsSpeaking(false);
    setIsPaused(false);
    stopVisemeLoop();
  }, [stopVisemeLoop, stopKeepAlive]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    availableVoices,
    selectedVoice,
    setSelectedVoice,
    speak,
    pause,
    resume,
    stop
  };
}
