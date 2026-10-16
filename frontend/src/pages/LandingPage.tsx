import React from 'react';
import {
  Play,
  Sparkles,
  Languages,
  Code2,
  TrendingUp,
  Award,
  ArrowRight,
  ShieldCheck,
  Volume2,
  Brain,
  Camera,
  Bot
} from 'lucide-react';
import { EilikRobotAvatar } from '../components/Avatar/EilikRobotAvatar';

interface LandingPageProps {
  onStartInterview: () => void;
  onExploreFeatures: () => void;
  onViewDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartInterview,
  onExploreFeatures,
  onViewDashboard
}) => {
  return (
    <div className="w-full flex flex-col space-y-16 sm:space-y-24 py-8 sm:py-16 animate-fadeIn">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Headline & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950/80 border border-teal-700/60 text-teal-300 text-xs font-semibold shadow-lg shadow-teal-950/40">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Meet Eilik – Your AI Interview Coach</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-tight leading-[1.15]">
            Enterprise AI Interviewer with{' '}
            <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              Live Webcam & Proctoring
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
            Practice smarter. Speak confidently. Get interview-ready. Experience realistic recruitment interviews with
            Eilik, your AI interviewer who speaks, patiently waits for your answers, and conducts proctored technical
            and HR evaluations in multiple Indian languages.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              onClick={onStartInterview}
              className="group px-7 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-bold text-sm sm:text-base transition-all duration-300 shadow-xl shadow-teal-950/50 flex items-center gap-3 cursor-pointer hover:scale-105"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Interview</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={onExploreFeatures}
              className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm sm:text-base transition cursor-pointer"
            >
              Explore Features
            </button>
          </div>

          {/* Quick Stats / Highlights */}
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
            <div>
              <div className="text-lg sm:text-2xl font-black text-teal-400">Live</div>
              <div className="text-[11px] text-slate-400">Webcam Stream</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-black text-cyan-400">3-Strike</div>
              <div className="text-[11px] text-slate-400">Anti-Cheat Proctoring</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-black text-indigo-400">Patient</div>
              <div className="text-[11px] text-slate-400">Waiting Logic</div>
            </div>
          </div>
        </div>

        {/* Right Column: Eilik Robot Hero Preview */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="w-full max-w-md">
            <EilikRobotAvatar
              state="speaking"
              visemeIntensity={0.65}
              robotName="Eilik Interviewer"
            />
          </div>
        </div>
      </section>

      {/* Enterprise Feature Cards */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-8 w-full space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Engineered for High-Stakes Campus & Corporate Hiring
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Simulate actual hiring manager evaluations with live candidate video, voice-to-text input, and diagnostic
            feedback rubrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Bot className="w-6 h-6 text-teal-400" />,
              title: 'Eilik Robot Interviewer',
              desc: 'Friendly, animated white-and-turquoise robot with glowing digital visor eyes, speech waveforms, and emotional reactions.',
              tag: 'Eilik Avatar'
            },
            {
              icon: <Camera className="w-6 h-6 text-cyan-400" />,
              title: 'Live Webcam & Mic Integration',
              desc: 'Displays candidate live video feed during the session with microphone input volume meters and camera controls.',
              tag: 'Live Video'
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-rose-400" />,
              title: '5-Strike Tab-Switch Proctoring',
              desc: 'Tracks when candidate switches away from the interview screen with 4 warnings and automatic termination on strike 5.',
              tag: 'Anti-Cheating'
            },
            {
              icon: <Brain className="w-6 h-6 text-indigo-400" />,
              title: 'Patient Waiting & No Rush',
              desc: 'Never skips questions or treats silence as an answer. Displays "Take your time" and advances only after manual submission.',
              tag: 'Strict Sequence'
            },
            {
              icon: <Languages className="w-6 h-6 text-emerald-400" />,
              title: 'Multilingual Indian Speech',
              desc: 'Conduct interviews naturally in English, Telugu (తెలుగు), Hindi (हिन्दी), Tamil (தமிழ்), Kannada (ಕನ್ನಡ), or Malayalam (മലയാളം).',
              tag: '6 Languages'
            },
            {
              icon: <Award className="w-6 h-6 text-amber-400" />,
              title: 'Performance Rating Scorecard',
              desc: 'Delivers overall scores, verdict ratings (Excellent, Good, Average, Needs Improvement), and missing concepts.',
              tag: 'Full Analysis'
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-teal-500/50 transition-all duration-300 space-y-4 group hover:-translate-y-1 shadow-lg"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/60 flex items-center justify-center group-hover:scale-110 transition">
                {feature.icon}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-100">{feature.title}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-teal-400 border border-slate-800">
                    {feature.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 w-full space-y-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 uppercase tracking-widest">
            Sequential Interview Flow
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            How the Proctored Session Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            {
              step: '01',
              title: 'Camera & Role Check',
              desc: 'Grant camera and mic access, select your role and preferred language.'
            },
            {
              step: '02',
              title: 'Eilik Speaks Question',
              desc: 'Eilik reads the question aloud, displays it on screen, and patiently waits.'
            },
            {
              step: '03',
              title: 'Speak or Type Response',
              desc: 'Take your time. Speak into mic or type. Review and submit when ready.'
            },
            {
              step: '04',
              title: 'Diagnostic Scorecard',
              desc: 'Receive your rating tier, missing concepts, model answers, and printable PDF.'
            }
          ].map((item, idx) => (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="text-2xl font-black text-teal-500/40 font-mono">{item.step}</div>
              <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 w-full">
        <div className="rounded-3xl glass-panel-glow p-8 sm:p-12 text-center space-y-6 border border-teal-500/40 relative overflow-hidden">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-100">
              Ready to Practice with Eilik?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Simulate enterprise recruitment interviews with live video and voice interaction in your native language.
            </p>
          </div>

          <button
            onClick={onStartInterview}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-bold text-sm sm:text-base transition shadow-xl shadow-teal-950/60 inline-flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Free Proctored Interview</span>
          </button>
        </div>
      </section>
    </div>
  );
};
