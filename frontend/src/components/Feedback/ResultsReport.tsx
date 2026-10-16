import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Download,
  RotateCcw,
  LayoutDashboard,
  Code2,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldAlert,
  XCircle,
  Target
} from 'lucide-react';
import { ReportData, QuestionFeedbackDetail, PerformanceRating } from '../../types';

interface ResultsReportProps {
  report: ReportData;
  onPracticeAgain: () => void;
  onBackToDashboard: () => void;
}

export const ResultsReport: React.FC<ResultsReportProps> = ({
  report,
  onPracticeAgain,
  onBackToDashboard
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  useEffect(() => {
    // Fire celebratory confetti on mount if not terminated and score is decent
    if (!report.is_terminated && report.overall_score >= 60) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [report.overall_score, report.is_terminated]);

  const handlePrint = () => {
    window.print();
  };

  const getRatingBadge = (rating: PerformanceRating) => {
    switch (rating) {
      case 'Excellent':
        return 'bg-emerald-950/80 border-emerald-500 text-emerald-300';
      case 'Good':
        return 'bg-teal-950/80 border-teal-500 text-teal-300';
      case 'Average':
        return 'bg-amber-950/80 border-amber-500 text-amber-300';
      case 'Needs Improvement':
      default:
        return 'bg-rose-950/80 border-rose-500 text-rose-300';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 65) return 'text-teal-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const performanceRating = report.performance_rating || (report.overall_score >= 85 ? 'Excellent' : report.overall_score >= 70 ? 'Good' : report.overall_score >= 55 ? 'Average' : 'Needs Improvement');

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-8 space-y-7 animate-fadeIn">
      {/* Termination Notice Banner if applicable */}
      {report.is_terminated && (
        <div className="rounded-2xl p-4 sm:p-5 bg-rose-950/70 border border-rose-600/60 shadow-xl flex items-start gap-3.5 text-rose-200">
          <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm sm:text-base text-rose-100">
              Interview Session Terminated: Repeated Tab Switching Detected
            </h3>
            <p className="text-xs sm:text-sm text-rose-300/90 leading-relaxed">
              Candidate switched away from the interview screen {report.proctoring_violations || 5} times. In
              accordance with recruitment proctoring policy (5-strike limit), this session was halted. The evaluation below reflects
              only answers submitted before termination.
            </p>
          </div>
        </div>
      )}


      {/* Main Scorecard Banner */}
      <div className="rounded-3xl glass-panel-glow p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-teal-500/30">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-700/60 text-teal-300 text-xs font-semibold">
              <Award className="w-3.5 h-3.5" /> AI Interview Performance Scorecard
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
              Evaluation & Analysis Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Candidate: <span className="text-slate-200 font-semibold">{report.candidate_name}</span> • Role:{' '}
              <span className="text-slate-200 font-semibold">{report.job_role}</span> • Language:{' '}
              <span className="text-teal-400 font-semibold">{report.language}</span>
            </p>

            {/* Performance Rating Verdict Badge */}
            <div className="pt-2 flex items-center justify-center md:justify-start gap-2">
              <span className="text-xs text-slate-400">Final Verdict:</span>
              <span
                className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getRatingBadge(
                  performanceRating
                )}`}
              >
                {performanceRating}
              </span>
            </div>
          </div>

          {/* Overall Score Dial */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-inner">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-teal-400 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * report.overall_score) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className={`text-3xl font-black ${getScoreColor(report.overall_score)}`}>
                  {Math.round(report.overall_score)}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  / 100
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-300 mt-2">Overall Proficiency</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
            "{report.summary}"
          </p>
        </div>
      </div>

      {/* Domain Score Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {[
          { label: 'Technical Depth', score: report.technical_score, icon: <Code2 className="w-4 h-4 text-teal-400" /> },
          { label: 'Communication Clarity', score: report.communication_score, icon: <MessageSquare className="w-4 h-4 text-cyan-400" /> },
          { label: 'Problem Solving', score: report.problem_solving_score, icon: <TrendingUp className="w-4 h-4 text-indigo-400" /> },
          { label: 'Relevance', score: report.relevance_score, icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
          { label: 'Clarity & Confidence', score: report.confidence_clarity_score, icon: <Lightbulb className="w-4 h-4 text-amber-400" /> }
        ].map((item, idx) => (
          <div key={idx} className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{item.label}</span>
              {item.icon}
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${getScoreColor(item.score)}`}>
                {Math.round(item.score)}
              </span>
              <span className="text-xs text-slate-500">/100</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-teal-400 rounded-full"
                style={{ width: `${Math.min(100, item.score)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Strengths & Weaknesses / Mistakes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Strengths */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-emerald-900/30 space-y-3">
          <h3 className="text-sm sm:text-base font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Candidate Strengths
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {report.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Missing Concepts & Mistakes Identified */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-amber-900/30 space-y-3">
          <h3 className="text-sm sm:text-base font-bold text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            Missing Concepts & Identified Mistakes
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {(report.missing_concepts && report.missing_concepts.length > 0
              ? report.missing_concepts
              : ['Secondary algorithmic runtime trade-offs (O(N) memory)', 'STAR impact metrics']
            ).map((mc, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-amber-950/20 border border-amber-900/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{mc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question-by-Question Deep Dive with Model Answers */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-400" />
          Question-by-Question Analysis ({report.questions_detail.length})
        </h3>

        <div className="space-y-3">
          {report.questions_detail.map((q, idx) => {
            const isExpanded = expandedIndex === idx;
            const isUnanswered = q.candidate_answer === 'Not Answered' || !q.candidate_answer.trim();

            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all duration-200"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-850/50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-slate-200 line-clamp-1">
                        {q.question_text}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {q.question_type} {isUnanswered && '• Not Answered'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold ${
                        isUnanswered
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : q.overall_score >= 75
                          ? 'bg-teal-950 text-teal-300 border-teal-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {Math.round(q.overall_score)} pts
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-800/80 space-y-3 text-xs animate-fadeIn">
                    {/* Candidate Answer */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <span className="text-slate-500 font-mono uppercase text-[10px] tracking-wider">
                        Candidate Answer:
                      </span>
                      <p
                        className={`leading-relaxed font-sans ${
                          isUnanswered ? 'text-rose-400 font-semibold' : 'text-slate-200'
                        }`}
                      >
                        {isUnanswered ? 'Not Answered' : q.candidate_answer}
                      </p>
                      {q.code_answer && (
                        <pre className="mt-2 p-2 rounded bg-slate-900 text-teal-300 font-mono text-[11px] overflow-x-auto">
                          {q.code_answer}
                        </pre>
                      )}
                    </div>

                    {/* Evaluator Feedback */}
                    <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-900/40 text-slate-300 space-y-1">
                      <span className="text-teal-400 font-semibold flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" /> Evaluator Feedback:
                      </span>
                      <p className="leading-relaxed">{q.feedback}</p>
                    </div>

                    {/* Suggested Improved Answer */}
                    {q.suggested_answer && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 space-y-1">
                        <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5" /> Improved Model Answer:
                        </span>
                        <p className="leading-relaxed text-slate-300">{q.suggested_answer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Topics for Next Round */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-200 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-teal-400" />
          Recommended Topics to Practice
        </h3>
        <div className="flex flex-wrap gap-2 pt-1">
          {report.recommended_topics.map((top, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-xl bg-teal-950/70 border border-teal-700/60 text-teal-300 text-xs font-medium"
            >
              {top}
            </span>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-slate-500 text-center leading-relaxed max-w-xl mx-auto">
        Disclaimer: AI evaluation scores are algorithmic estimations for mock practice and coaching. Browser-based tab
        monitoring provides guidance and does not replace official human examination invigilation.
      </p>

      {/* Bottom Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 print:hidden">
        <button
          onClick={onPracticeAgain}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-teal-950/50 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Interview</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF / Print</span>
        </button>

        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium text-xs sm:text-sm transition cursor-pointer"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
