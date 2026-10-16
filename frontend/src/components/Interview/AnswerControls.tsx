import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Send,
  SkipForward,
  Keyboard,
  RotateCcw,
  AlertCircle,
  Pause,
  Play,
  Clock,
  Volume2
} from 'lucide-react';
import { VoiceWaveform } from '../Avatar/VoiceWaveform';

interface AnswerControlsProps {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  onTranscriptChange: (text: string) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onResetTranscript: () => void;
  onSubmitAnswer: () => void;
  onSkipQuestion: () => void;
  onTogglePause: () => void;
  isPaused: boolean;
  isSubmitting: boolean;
  permissionError: string | null;
  audioVolume: number;
  answeringTimeSeconds: number;
  isSilenceWaiting?: boolean;
}

export const AnswerControls: React.FC<AnswerControlsProps> = ({
  isListening,
  transcript,
  interimTranscript,
  onTranscriptChange,
  onStartListening,
  onStopListening,
  onResetTranscript,
  onSubmitAnswer,
  onSkipQuestion,
  onTogglePause,
  isPaused,
  isSubmitting,
  permissionError,
  audioVolume,
  answeringTimeSeconds,
  isSilenceWaiting = false
}) => {
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const currentDisplay = transcript + (interimTranscript ? ` ${interimTranscript}` : '');
  const canSubmit = currentDisplay.trim().length > 0 && !isSubmitting;

  return (
    <div className="w-full rounded-2xl glass-panel p-4 sm:p-5 shadow-2xl flex flex-col gap-4 border border-slate-800">
      {/* Controls Bar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setInputMode('voice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              inputMode === 'voice'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Answer</span>
          </button>

          <button
            onClick={() => setInputMode('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              inputMode === 'text'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Type Answer</span>
          </button>
        </div>

        {/* Answering Timer & Pause */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-mono px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>{formatTimer(answeringTimeSeconds)}</span>
          </div>

          <button
            onClick={onTogglePause}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title={isPaused ? 'Resume interview' : 'Pause interview'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
          </button>
        </div>
      </div>

      {/* Patient Waiting / Silence Prompt Banner */}
      {isSilenceWaiting && !currentDisplay.trim() && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2 animate-fadeIn">
          <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="font-medium">
            Take your time. I'm waiting for your answer. Click the microphone to speak or type below when ready.
          </span>
        </div>
      )}

      {/* Permission Warning if Microphone is blocked */}
      {permissionError && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Voice Visualizer / Big Mic Area */}
      {inputMode === 'voice' && (
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="mb-2 w-full">
            <VoiceWaveform
              isActive={isListening}
              amplitude={audioVolume > 0 ? audioVolume : 0.35}
              color={isListening ? '#14b8a6' : '#06b6d4'}
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={isListening ? onStopListening : onStartListening}
              className={`relative px-6 py-2.5 rounded-full flex items-center gap-2 font-bold text-xs sm:text-sm transition-all duration-300 shadow-xl cursor-pointer ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40 scale-105'
                  : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-900/40'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 animate-pulse" />
                  <span>Stop Recording</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Click to Speak Answer</span>
                </>
              )}
            </button>

            {transcript && (
              <button
                onClick={onResetTranscript}
                title="Clear transcript"
                className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
          <span className="text-[11px] text-slate-400 mt-2">
            {isListening
              ? 'Listening to your voice... Speak clearly'
              : 'Click above to speak, or switch to Type Answer'}
          </span>
        </div>
      )}

      {/* Live Transcript / Editable Answer Area */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <label className="font-semibold text-slate-300">
            {inputMode === 'voice' ? 'Your Answer Transcript (Review or edit before submitting):' : 'Write your detailed response:'}
          </label>
          <span className="text-[11px]">
            {currentDisplay.trim().split(/\s+/).filter(Boolean).length} words
          </span>
        </div>

        <textarea
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          placeholder={
            inputMode === 'voice'
              ? 'Your spoken answer will appear here in real time. You can review or edit it before submitting...'
              : 'Type your comprehensive response here. Explain your thought process, architecture, and examples...'
          }
          rows={3}
          className="w-full glass-input rounded-xl p-3 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-none transition leading-relaxed resize-none"
        />

        {interimTranscript && (
          <div className="text-xs text-teal-300 italic font-mono px-2">
            Transcribing: "{interimTranscript}..."
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <button
          onClick={onSkipQuestion}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-medium transition disabled:opacity-50 cursor-pointer"
        >
          <SkipForward className="w-3.5 h-3.5" />
          <span>Skip Question</span>
        </button>

        <button
          onClick={onSubmitAnswer}
          disabled={!canSubmit}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-teal-950/50 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Evaluating Answer...' : 'Submit Answer'}</span>
        </button>
      </div>
    </div>
  );
};
