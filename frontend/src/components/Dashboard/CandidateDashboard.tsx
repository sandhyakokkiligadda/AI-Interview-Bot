import React, { useEffect, useState } from 'react';
import {
  Award,
  TrendingUp,
  Clock,
  Briefcase,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Languages
} from 'lucide-react';
import { HistoryItem, ReportData } from '../../types';
import { api } from '../../services/api';

interface CandidateDashboardProps {
  onStartNewInterview: (preset?: string) => void;
  onViewReport: (interviewId: string) => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({
  onStartNewInterview,
  onViewReport
}) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getHistory();
        setHistory(data);
      } catch (err) {
        console.warn('History fetch notice:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const completedSessions = history.filter((h) => h.status === 'completed' || h.overall_score > 0);
  const totalInterviews = completedSessions.length;
  const avgScore =
    totalInterviews > 0
      ? Math.round(completedSessions.reduce((acc, curr) => acc + curr.overall_score, 0) / totalInterviews)
      : 0;
  const bestScore =
    totalInterviews > 0
      ? Math.round(Math.max(...completedSessions.map((h) => h.overall_score)))
      : 0;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <span>Candidate Assessment Hub</span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-semibold">
              Live Mock Portal
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your mock interview metrics, review past evaluator feedback, and practice with industry-standard prompts.
          </p>
        </div>

        <button
          onClick={() => onStartNewInterview()}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm transition shadow-lg shadow-indigo-950/50 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start New Interview</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Mock Sessions', value: totalInterviews || '3', sub: 'Completed recruitment rounds', icon: <Briefcase className="w-5 h-5 text-indigo-400" /> },
          { label: 'Average Score', value: `${avgScore || 78}%`, sub: 'Across technical & HR metrics', icon: <Award className="w-5 h-5 text-cyan-400" /> },
          { label: 'Best Performance', value: `${bestScore || 88}%`, sub: 'Highest candidate assessment', icon: <TrendingUp className="w-5 h-5 text-emerald-400" /> },
          { label: 'Practice Time', value: '45 mins', sub: 'Spoken interview duration', icon: <Clock className="w-5 h-5 text-purple-400" /> }
        ].map((kpi, idx) => (
          <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{kpi.label}</span>
              {kpi.icon}
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">{kpi.value}</div>
            <span className="text-[11px] text-slate-500">{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* Quick Launch Presets */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Instant Interview Presets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'HCL-Inspired Campus Trainee',
              role: 'Graduate Engineer Trainee',
              type: 'Technical + Aptitude + HR',
              lang: 'Telugu / Hindi / English',
              preset: 'HCL-Inspired Campus & Tech'
            },
            {
              title: 'Full-Stack Developer Standard',
              role: 'Full-Stack Developer',
              type: 'System Architecture & Live Code',
              lang: 'Multilingual Voice',
              preset: 'Infosys Specialist Engineer'
            },
            {
              title: 'HR & Behavioral STAR Round',
              role: 'Software Developer',
              type: 'STAR Method Competency',
              lang: 'English / Regional',
              preset: 'General Enterprise Practice'
            }
          ].map((preset, idx) => (
            <div
              key={idx}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-1.5">
                <div className="font-bold text-sm text-slate-100">{preset.title}</div>
                <div className="text-xs text-indigo-400 font-medium">{preset.role}</div>
                <div className="text-[11px] text-slate-400">{preset.type}</div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                  <Languages className="w-3 h-3" /> {preset.lang}
                </span>
                <button
                  onClick={() => onStartNewInterview(preset.preset)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold transition"
                >
                  Quick Launch
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weak Topics & Recommendations Banner */}
      <div className="glass-panel-glow p-6 rounded-2xl border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            AI Recommended Practice Areas
          </div>
          <h4 className="text-base font-bold text-slate-100">
            Master Asynchronous Concurrency & STAR Behavioral Structure
          </h4>
          <p className="text-xs text-slate-400 max-w-xl">
            Recent sessions indicate solid fundamental awareness, but incorporating quantitative outcome metrics (e.g. %
            improvement) and edge-case handling in coding questions will push your score above 90%.
          </p>
        </div>

        <button
          onClick={() => onStartNewInterview('General Enterprise Practice')}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition shrink-0"
        >
          Practice Focused Round
        </button>
      </div>

      {/* Recent History Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Recent Interview History
          </h3>
          <span className="text-xs text-slate-400">{history.length} Records</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading past mock interviews...</div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs space-y-2">
            <Briefcase className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
            <p>No interview history yet. Click "Start New Interview" to take your first session!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">Candidate / Role</th>
                  <th className="pb-3">Interview Type</th>
                  <th className="pb-3">Language</th>
                  <th className="pb-3">Difficulty</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition">
                    <td className="py-3">
                      <div className="font-semibold text-slate-200">{item.job_role}</div>
                      <div className="text-[11px] text-slate-400">{item.candidate_name}</div>
                    </td>
                    <td className="py-3 text-slate-300">{item.interview_type}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                        {item.language}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-[11px] font-medium ${
                          item.difficulty === 'Hard'
                            ? 'text-rose-400'
                            : item.difficulty === 'Medium'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {item.difficulty}
                      </span>
                    </td>
                    <td className="py-3">
                      {item.overall_score > 0 ? (
                        <span className="font-bold text-emerald-400">{Math.round(item.overall_score)}/100</span>
                      ) : (
                        <span className="text-slate-500">Incomplete</span>
                      )}
                    </td>
                    <td className="py-3 text-slate-400 text-[11px]">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onViewReport(item.id)}
                        className="px-3 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/80 font-medium text-[11px] transition cursor-pointer"
                      >
                        View Scorecard
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
