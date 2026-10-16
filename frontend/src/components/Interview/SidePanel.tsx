import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  MessageSquare,
  HelpCircle,
  ChevronRight,
  Sparkles,
  Award
} from 'lucide-react';
import { QuestionData, EvaluationData } from '../../types';

interface PastQAItem {
  question: QuestionData;
  answerText: string;
  evaluation?: EvaluationData;
}

interface SidePanelProps {
  currentIndex: number;
  totalQuestions: number;
  elapsedSeconds: number;
  pastQAList: PastQAItem[];
  jobRole: string;
  interviewType: string;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  currentIndex,
  totalQuestions,
  elapsedSeconds,
  pastQAList,
  jobRole,
  interviewType
}) => {
  const [activeTab, setActiveTab] = useState<'progress' | 'history' | 'coaching'>('progress');

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, Math.round(((currentIndex) / totalQuestions) * 100));

  return (
    <div className="w-full h-full rounded-2xl glass-panel p-4 flex flex-col shadow-2xl overflow-hidden border border-slate-800">
      {/* Session Timer & Progress Bar */}
      <div className="pb-3 border-b border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium text-slate-300">Session Progress</span>
          <span className="flex items-center gap-1 font-mono text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(elapsedSeconds)}
          </span>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-500 mt-1">
          <span>{currentIndex} of {totalQuestions} completed</span>
          <span>{progressPercent}%</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between p-1 bg-slate-900/80 rounded-xl my-3 text-xs">
        <button
          onClick={() => setActiveTab('progress')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition text-center ${
            activeTab === 'progress'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition text-center ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Q&A History ({pastQAList.length})
        </button>
        <button
          onClick={() => setActiveTab('coaching')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition text-center ${
            activeTab === 'coaching'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          STAR Coach
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
        {activeTab === 'progress' && (
          <div className="space-y-2">
            {Array.from({ length: totalQuestions }).map((_, idx) => {
              const isDone = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const pastItem = pastQAList[idx];

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    isCurrent
                      ? 'bg-indigo-950/60 border-indigo-500/50 shadow-md'
                      : isDone
                      ? 'bg-slate-900/60 border-slate-800'
                      : 'bg-slate-900/20 border-slate-850 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isCurrent
                          ? 'bg-indigo-600 text-white animate-pulse'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <div>
                      <div className="font-medium text-slate-200">Question {idx + 1}</div>
                      <div className="text-[10px] text-slate-400">
                        {isCurrent ? 'Active • In progress' : isDone ? 'Answered' : 'Upcoming'}
                      </div>
                    </div>
                  </div>

                  {isDone && pastItem?.evaluation && (
                    <div className="px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-800/40 text-emerald-300 font-semibold text-[11px]">
                      {Math.round(pastItem.evaluation.overall_score)}/100
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {pastQAList.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40" />
                <span>No answered questions yet. Your submitted responses and scores will appear here.</span>
              </div>
            ) : (
              pastQAList.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between font-semibold text-slate-300">
                    <span>Q{idx + 1}: {item.question.question_type}</span>
                    {item.evaluation && (
                      <span className="text-emerald-400">{Math.round(item.evaluation.overall_score)} pts</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] line-clamp-2 italic">
                    "{item.question.question_text}"
                  </p>
                  <div className="p-2 rounded bg-slate-950 text-slate-300 text-[11px] leading-relaxed">
                    <span className="text-slate-500 font-mono">Answer: </span>
                    {item.answerText}
                  </div>
                  {item.evaluation?.feedback && (
                    <div className="text-[11px] text-indigo-300/90 pt-1 border-t border-slate-800/60">
                      💡 {item.evaluation.feedback}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'coaching' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-slate-300 space-y-2">
              <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                STAR Framework for Behavioral Qs
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Enterprise interviewers score responses significantly higher when structured using the STAR method:
              </p>

              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <strong className="text-cyan-400">S - Situation:</strong> Set the context, team size, and background challenge.
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <strong className="text-indigo-400">T - Task:</strong> Clarify your exact responsibility and key objective.
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <strong className="text-purple-400">A - Action:</strong> Explain the specific tools, algorithms, or collaboration steps you executed.
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <strong className="text-emerald-400">R - Result:</strong> Provide quantifiable impact (e.g. "reduced latency by 40%", "delivered 2 days early").
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" /> Top Interview Tips:
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li>Speak at a steady, measured pace.</li>
                <li>Explicitly state trade-offs (e.g. Memory vs CPU).</li>
                <li>Ask for clarification if an edge case is ambiguous.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
