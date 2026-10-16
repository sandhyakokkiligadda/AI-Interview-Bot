import React from 'react';
import { Bot, Sparkles, LayoutDashboard, Play, ShieldCheck, Languages } from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'setup' | 'interview' | 'report' | 'dashboard';
  onNavigate: (view: 'landing' | 'setup' | 'dashboard') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  return (
    <nav className="w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-40 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-900/40 group-hover:scale-105 transition">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-400 group-hover:text-cyan-400 transition" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              AI Interview Bot
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 font-medium">
              Enterprise 2.0
            </span>
          </div>
        </button>

        {/* Center / Right Links */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              currentView === 'landing'
                ? 'bg-slate-900 text-slate-100 border border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-slate-900 text-slate-100 border border-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('setup')}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-indigo-950/40 transition cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Start Interview</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
