import React, { useState, useEffect } from 'react';
import { AvatarState } from '../../types';
import {
  Volume2,
  Mic,
  Clock,
  Brain,
  Smile,
  Award,
  Sparkles,
  Bot
} from 'lucide-react';
import eilikImage from '../../assets/eilik.jpg';

interface EilikRobotAvatarProps {
  state: AvatarState;
  visemeIntensity?: number;
  className?: string;
  robotName?: string;
}

const STATE_CONFIG: Record<
  AvatarState,
  { label: string; icon: React.ReactNode; badgeClass: string; auraColor: string }
> = {
  idle: {
    label: 'Ready & Attentive',
    icon: <Bot className="w-3.5 h-3.5 text-teal-400" />,
    badgeClass: 'bg-slate-900/90 text-teal-300 border-teal-500/40',
    auraColor: 'rgba(20, 184, 166, 0.25)'
  },
  speaking: {
    label: 'Speaking Question...',
    icon: <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />,
    badgeClass: 'bg-cyan-950/90 text-cyan-300 border-cyan-400/50 shadow-cyan-900/30',
    auraColor: 'rgba(6, 182, 212, 0.65)'
  },
  listening: {
    label: 'Listening to Candidate...',
    icon: <Mic className="w-3.5 h-3.5 text-teal-400 animate-bounce" />,
    badgeClass: 'bg-teal-950/90 text-teal-300 border-teal-400/60 shadow-teal-900/30',
    auraColor: 'rgba(20, 184, 166, 0.65)'
  },
  waiting: {
    label: 'Waiting for Your Answer...',
    icon: <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />,
    badgeClass: 'bg-amber-950/90 text-amber-300 border-amber-500/50',
    auraColor: 'rgba(245, 158, 11, 0.35)'
  },
  thinking: {
    label: 'Analyzing Response...',
    icon: <Brain className="w-3.5 h-3.5 text-indigo-400 animate-spin" />,
    badgeClass: 'bg-indigo-950/90 text-indigo-300 border-indigo-400/50',
    auraColor: 'rgba(99, 102, 241, 0.5)'
  },
  encouraging: {
    label: 'Good Answer!',
    icon: <Smile className="w-3.5 h-3.5 text-emerald-400" />,
    badgeClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-400/50',
    auraColor: 'rgba(16, 185, 129, 0.55)'
  },
  completed: {
    label: 'Interview Concluded',
    icon: <Award className="w-3.5 h-3.5 text-purple-400" />,
    badgeClass: 'bg-purple-950/90 text-purple-300 border-purple-400/50',
    auraColor: 'rgba(168, 85, 247, 0.6)'
  }
};

export const EilikRobotAvatar: React.FC<EilikRobotAvatarProps> = ({
  state,
  visemeIntensity = 0,
  className = '',
  robotName = 'Eilik AI'
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.idle;

  // Natural periodic blinking loop
  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        const nextInterval = 2500 + Math.random() * 3000;
        blinkTimeout = setTimeout(triggerBlink, nextInterval);
      }, 180);
    };

    blinkTimeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(blinkTimeout);
  }, []);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Ambient background glowing aura */}
      <div
        className="absolute inset-0 rounded-3xl blur-3xl transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${cfg.auraColor} 0%, transparent 70%)`
        }}
      />

      {/* Main Robot Card */}
      <div className="relative w-full max-w-sm rounded-3xl p-5 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-teal-500/20 shadow-2xl overflow-hidden flex flex-col items-center">
        {/* Decorative top pill */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span className="font-bold text-slate-100 tracking-wide">{robotName}</span>
            <span className="text-[10px] text-teal-400 px-2 py-0.5 rounded-full bg-teal-950 border border-teal-800/60 font-mono">
              Interviewer
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Online</span>
          </div>
        </div>

        {/* Eilik Image Container with Floating and Glow */}
        <div className="relative my-4 w-60 h-60 sm:w-68 sm:h-68 flex items-center justify-center animate-eilik-float">
          {/* Subtle audio visualizer ring behind robot */}
          <div
            className={`absolute inset-4 rounded-full border-2 transition-all duration-300 pointer-events-none ${
              state === 'speaking'
                ? 'border-cyan-400/60 scale-110 animate-wave-ripple'
                : state === 'listening'
                ? 'border-teal-400/60 scale-105 animate-pulse'
                : 'border-teal-500/20'
            }`}
          />

          {/* Uploaded Eilik Robot Image */}
          <img
            src={eilikImage}
            alt="Eilik AI Robot Interviewer"
            className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(20,184,166,0.35)] transition-all duration-300"
          />

          {/* Interactive Digital Eyes Overlay on Eilik Visor Screen */}
          <div className="absolute top-[28%] left-[34%] w-[32%] h-[16%] flex items-center justify-center pointer-events-none">
            {isBlinking ? (
              // Blinking line
              <div className="flex items-center justify-between w-full px-2">
                <span className="w-3 h-0.5 bg-cyan-300 shadow-[0_0_8px_#06b6d4] rounded-full" />
                <span className="w-3 h-0.5 bg-cyan-300 shadow-[0_0_8px_#06b6d4] rounded-full" />
              </div>
            ) : state === 'encouraging' ? (
              // Happy upward curved eyes (^ ^)
              <div className="flex items-center justify-between w-full px-1">
                <svg className="w-5 h-4 text-cyan-300 filter drop-shadow-[0_0_6px_#06b6d4]" viewBox="0 0 24 16">
                  <path d="M 3 13 Q 12 1 21 13" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
                <svg className="w-5 h-4 text-cyan-300 filter drop-shadow-[0_0_6px_#06b6d4]" viewBox="0 0 24 16">
                  <path d="M 3 13 Q 12 1 21 13" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
            ) : state === 'listening' ? (
              // Attentive wide glowing circular eyes
              <div className="flex items-center justify-between w-full px-1">
                <div className="w-4 h-4 rounded-full bg-cyan-300 shadow-[0_0_12px_#00f0ff] animate-pulse" />
                <div className="w-4 h-4 rounded-full bg-cyan-300 shadow-[0_0_12px_#00f0ff] animate-pulse" />
              </div>
            ) : state === 'thinking' ? (
              // Thoughtful blinking / rotating dots
              <div className="flex items-center justify-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-300 shadow-[0_0_8px_#818cf8] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#06b6d4] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-teal-300 shadow-[0_0_8px_#14b8a6] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              // Standard calm glowing cyan eye arches
              <div className="flex items-center justify-between w-full px-1.5 animate-eye-glow">
                <div className="w-3.5 h-3 rounded-t-full bg-cyan-300 shadow-[0_0_10px_#00f0ff]" />
                <div className="w-3.5 h-3 rounded-t-full bg-cyan-300 shadow-[0_0_10px_#00f0ff]" />
              </div>
            )}
          </div>

          {/* Speaking Audio Viseme Bars near base of robot */}
          {state === 'speaking' && (
            <div className="absolute bottom-2 flex items-center justify-center gap-1 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-500/40 shadow-lg">
              {[0.4, 0.8, 1.0, 0.7, 0.5].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-cyan-400 rounded-full animate-pulse"
                  style={{
                    height: `${Math.max(6, (visemeIntensity || h) * 18)}px`,
                    animationDelay: `${i * 120}ms`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* State Badge */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl border shadow-xl text-xs font-semibold backdrop-blur-md transition-all duration-300 ${cfg.badgeClass}`}
        >
          {cfg.icon}
          <span>{cfg.label}</span>
        </div>
      </div>
    </div>
  );
};
