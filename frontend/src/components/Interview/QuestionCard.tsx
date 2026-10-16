import React, { useState } from 'react';
import { Volume2, HelpCircle, Sparkles, Languages, ArrowRight } from 'lucide-react';
import { QuestionData, SupportedLanguage } from '../../types';

interface QuestionCardProps {
  question: QuestionData;
  onRepeatQuestion: () => void;
  isSpeaking: boolean;
  enableHints?: boolean;
  currentLanguage: SupportedLanguage;
  onLanguageChange?: (newLang: SupportedLanguage) => void;
}

const SUPPORTED_LANGS: SupportedLanguage[] = [
  'English',
  'Telugu',
  'Hindi',
  'Tamil',
  'Kannada',
  'Malayalam'
];

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onRepeatQuestion,
  isSpeaking,
  enableHints = true,
  currentLanguage,
  onLanguageChange
}) => {
  const [showHint, setShowHint] = useState<boolean>(false);

  const getTypeBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'technical':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60';
      case 'coding':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60';
      case 'hr':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/60';
      case 'behavioral':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
      case 'aptitude':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="w-full rounded-2xl glass-panel-glow p-5 sm:p-6 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Decorative gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-indigo-900/60 border border-indigo-700/60 text-indigo-200 text-xs font-semibold">
            Question {question.question_index + 1} of {question.total_questions}
          </span>

          <span
            className={`px-2.5 py-1 rounded-md border text-xs font-medium uppercase tracking-wider ${getTypeBadgeClass(
              question.question_type
            )}`}
          >
            {question.question_type}
          </span>

          {question.is_follow_up && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Adaptive Follow-up
            </span>
          )}
        </div>

        {/* Quick Language switcher & Voice Repeat */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <Languages className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange?.(e.target.value as SupportedLanguage)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs"
            >
              {SUPPORTED_LANGS.map((lang) => (
                <option key={lang} value={lang} className="bg-slate-900 text-slate-200">
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onRepeatQuestion}
            disabled={isSpeaking}
            title="Repeat question"
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition disabled:opacity-50"
          >
            <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-indigo-400 animate-pulse' : 'text-slate-400'}`} />
            <span>{isSpeaking ? 'Speaking...' : 'Repeat Audio'}</span>
          </button>
        </div>
      </div>

      {/* Main Question Text */}
      <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-slate-100 leading-relaxed mb-4">
        {question.question_text}
      </h2>

      {/* Expected Concepts / Hints toggle */}
      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        {enableHints && question.hints && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
          </button>
        )}

        {question.expected_concepts && question.expected_concepts.length > 0 && (
          <div className="flex items-center gap-1.5 text-slate-400 flex-wrap">
            <span className="text-[11px] text-slate-500">Key Themes:</span>
            {question.expected_concepts.slice(0, 3).map((concept, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[10px]">
                {concept}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Revealed Hint Box */}
      {showHint && question.hints && (
        <div className="mt-3 p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-200/90 text-xs leading-relaxed animate-fadeIn">
          <div className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Interviewer Hint:
          </div>
          {question.hints}
        </div>
      )}
    </div>
  );
};
