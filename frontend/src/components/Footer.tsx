import React from 'react';
import { Bot, Shield, Languages, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 py-8 px-4 sm:px-8 mt-auto text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-400">AI Interview Bot</span>
          <span>• Enterprise Recruitment & Mock Simulator</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1">
            <Languages className="w-3.5 h-3.5 text-cyan-400" /> 6 Indian Languages
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Private & Secure
          </span>
        </div>

        <div className="text-[11px] text-slate-600">
          Designed for Campus Placements & Enterprise Tech Rounds
        </div>
      </div>
    </footer>
  );
};
