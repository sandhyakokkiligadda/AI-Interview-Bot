import React, { useState } from 'react';
import {
  Briefcase,
  Layers,
  GraduationCap,
  Gauge,
  Clock,
  Languages,
  FileText,
  Sparkles,
  Sliders,
  CheckCircle2,
  ArrowRight,
  User,
  Volume2
} from 'lucide-react';
import { InterviewConfig, SupportedLanguage, AvatarStyle } from '../../types';
import { api } from '../../services/api';

interface InterviewSetupProps {
  onStartInterview: (config: InterviewConfig) => void;
  onCancel?: () => void;
  initialPreset?: string;
}

const INTERVIEW_TYPES = [
  'Technical Interview',
  'HR Interview',
  'Coding Interview',
  'Aptitude Interview',
  'Behavioral Interview',
  'Full Mock Interview',
  'Custom Interview'
];

const JOB_ROLES = [
  'Software Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'Python Developer',
  'Java Developer',
  'AI/ML Engineer',
  'Data Analyst',
  'Graduate Engineer Trainee',
  'Custom Role'
];

const EXPERIENCE_LEVELS = ['Fresher', 'Internship', 'Entry Level', 'Experienced'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DURATIONS = [5, 10, 15, 30];
const LANGUAGES: SupportedLanguage[] = [
  'English',
  'Telugu',
  'Hindi',
  'Tamil',
  'Kannada',
  'Malayalam'
];

const COMPANY_PRESETS = [
  {
    name: 'HCL-Inspired Campus & Tech',
    desc: 'Graduate Engineer Trainee technical, aptitude, & HR mix inspired by HCL recruitment bot',
    role: 'Graduate Engineer Trainee',
    type: 'Full Mock Interview',
    difficulty: 'Medium',
    questions: 5
  },
  {
    name: 'TCS Ninja & Digital Mock',
    desc: 'Core fundamentals in programming, SQL, and quantitative aptitude',
    role: 'Software Developer',
    type: 'Technical Interview',
    difficulty: 'Medium',
    questions: 5
  },
  {
    name: 'Infosys Specialist Engineer',
    desc: 'Data structures, algorithm complexity, and live coding exercises',
    role: 'Full-Stack Developer',
    type: 'Coding Interview',
    difficulty: 'Hard',
    questions: 5
  },
  {
    name: 'General Enterprise Practice',
    desc: 'Standard multi-round technical and behavioral evaluation',
    role: 'Software Developer',
    type: 'Technical Interview',
    difficulty: 'Medium',
    questions: 5
  }
];

export const InterviewSetup: React.FC<InterviewSetupProps> = ({
  onStartInterview,
  onCancel,
  initialPreset
}) => {
  const [candidateName, setCandidateName] = useState<string>('Candidate');
  const [interviewType, setInterviewType] = useState<string>('Technical Interview');
  const [jobRole, setJobRole] = useState<string>('Software Developer');
  const [customRole, setCustomRole] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<string>('Fresher');
  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [language, setLanguage] = useState<SupportedLanguage>('English');
  const [interviewMode, setInterviewMode] = useState<'voice' | 'text' | 'voice_and_text'>('voice_and_text');
  const [enableHints, setEnableHints] = useState<boolean>(true);
  const [enableCoding, setEnableCoding] = useState<boolean>(true);
  const [totalQuestions, setTotalQuestions] = useState<number>(5);
  const [selectedPreset, setSelectedPreset] = useState<string>(initialPreset || 'General Enterprise Practice');
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>('eilik');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);

  // Resume & Job Description
  const [resumeText, setResumeText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [parsedSkills, setParsedSkills] = useState<string[]>([]);
  const [isParsingResume, setIsParsingResume] = useState<boolean>(false);

  const applyPreset = (preset: typeof COMPANY_PRESETS[0]) => {
    setSelectedPreset(preset.name);
    setJobRole(preset.role);
    setInterviewType(preset.type);
    setDifficulty(preset.difficulty);
    setTotalQuestions(preset.questions);
  };

  const handleResumeParse = async () => {
    if (!resumeText.trim()) return;
    setIsParsingResume(true);
    try {
      const result = await api.parseResume(resumeText);
      setParsedSkills(result.skills);
      if (result.suggested_roles && result.suggested_roles.length > 0) {
        setJobRole(result.suggested_roles[0]);
      }
    } catch (e) {
      console.warn('Failed to parse resume:', e);
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleStart = () => {
    const finalRole = jobRole === 'Custom Role' && customRole.trim() ? customRole.trim() : jobRole;
    const config: InterviewConfig = {
      candidateName,
      interviewType,
      jobRole: finalRole,
      experienceLevel,
      difficulty,
      durationMinutes,
      language,
      interviewMode,
      enableHints,
      enableCoding,
      companyPreset: selectedPreset,
      resumeText: resumeText.trim() || undefined,
      jobDescription: jobDescription.trim() || undefined,
      totalQuestions,
      avatarStyle,
      voiceSpeed
    };
    onStartInterview(config);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Enterprise Interview Simulator
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
          Configure Your Mock Interview
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Customize your role, regional language, avatar persona, and difficulty to mirror real enterprise hiring assessments.
        </p>
      </div>

      {/* Company Style Presets */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
          Enterprise Practice Presets
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {COMPANY_PRESETS.map((p) => {
            const isSelected = selectedPreset === p.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className={`text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'glass-panel-glow border-indigo-500 text-white'
                    : 'glass-panel border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-xs text-slate-200 mb-1">
                  <span>{p.name}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{p.desc}</p>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-cyan-400">
                  <span>{p.role}</span> • <span>{p.difficulty}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Candidate Info */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <User className="w-4 h-4 text-cyan-400" /> Candidate Profile
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Your Full Name</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full glass-input rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Experience Level</label>
            <div className="grid grid-cols-2 gap-2">
              {EXPERIENCE_LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setExperienceLevel(lvl)}
                  className={`py-1.5 rounded-lg text-xs font-medium border transition ${
                    experienceLevel === lvl
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Interview Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`py-1.5 rounded-lg text-xs font-medium border transition ${
                    difficulty === diff
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Role & Interview Type */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Briefcase className="w-4 h-4 text-indigo-400" /> Target Role & Type
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Job Role</label>
            <select
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-slate-100 bg-slate-900 focus:outline-none cursor-pointer"
            >
              {JOB_ROLES.map((role) => (
                <option key={role} value={role} className="bg-slate-900 text-slate-200">
                  {role}
                </option>
              ))}
            </select>
          </div>

          {jobRole === 'Custom Role' && (
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Specify Custom Role</label>
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Cloud Security Specialist"
                className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Interview Type</label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="w-full glass-input rounded-xl px-3.5 py-2 text-xs text-slate-100 bg-slate-900 focus:outline-none cursor-pointer"
            >
              {INTERVIEW_TYPES.map((type) => (
                <option key={type} value={type} className="bg-slate-900 text-slate-200">
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Duration & Questions</label>
            <div className="flex items-center gap-2">
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="flex-1 glass-input rounded-xl px-3 py-2 text-xs text-slate-100 bg-slate-900 focus:outline-none"
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} Minutes
                  </option>
                ))}
              </select>

              <select
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="flex-1 glass-input rounded-xl px-3 py-2 text-xs text-slate-100 bg-slate-900 focus:outline-none"
              >
                {[3, 5, 8, 10].map((q) => (
                  <option key={q} value={q}>
                    {q} Questions
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Language & Voice Settings */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Languages className="w-4 h-4 text-purple-400" /> Language & Avatar
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Interview Language</label>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-left transition flex items-center justify-between ${
                    language === lang
                      ? 'bg-purple-900/60 border-purple-500 text-purple-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{lang}</span>
                  {language === lang && <CheckCircle2 className="w-3 h-3 text-purple-400" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Interviewer Avatar</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'eilik', name: '🤖 Eilik', desc: 'Proctored AI (Featured)' },
                { id: 'elena', name: 'Elena', desc: 'Tech Lead' },
                { id: 'priya', name: 'Priya', desc: 'HR Lead' },
                { id: 'alex', name: 'Alex', desc: 'Architect' }
              ].map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setAvatarStyle(av.id as AvatarStyle)}
                  className={`py-2 px-1 rounded-xl text-center border transition ${
                    avatarStyle === av.id
                      ? 'bg-teal-950/80 border-teal-500 text-white shadow-md shadow-teal-950/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-semibold">{av.name}</div>
                  <div className="text-[10px] text-slate-500">{av.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <label>Speech Speed</label>
              <span className="font-mono text-cyan-400">{voiceSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.2"
              step="0.1"
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Additional Settings: Resume, Job Description & Toggles */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
          <FileText className="w-4 h-4 text-emerald-400" /> Resume & Personalization (Optional)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-400">Paste Resume Text</label>
              {resumeText && (
                <button
                  type="button"
                  onClick={handleResumeParse}
                  disabled={isParsingResume}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  {isParsingResume ? 'Extracting skills...' : 'Extract Skills'}
                </button>
              )}
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume or skills summary here. The AI will personalize questions based on your projects..."
              rows={3}
              className="w-full glass-input rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none resize-none"
            />
            {parsedSkills.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-slate-500">Extracted Skills:</span>
                {parsedSkills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] border border-indigo-800">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Target Job Description (Optional)</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description or requirements to align mock questions directly with the role..."
              rows={3}
              className="w-full glass-input rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableHints}
              onChange={(e) => setEnableHints(e.target.checked)}
              className="rounded accent-indigo-500"
            />
            <span>Enable Hints during interview</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableCoding}
              onChange={(e) => setEnableCoding(e.target.checked)}
              className="rounded accent-indigo-500"
            />
            <span>Include Coding Questions in IDE</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Interaction Mode:</span>
            <div className="inline-flex rounded-lg bg-slate-900 border border-slate-800 p-0.5">
              {(['voice', 'voice_and_text', 'text'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setInterviewMode(m)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                    interviewMode === m
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m === 'voice_and_text' ? 'Voice + Text' : m === 'voice' ? 'Voice Only' : 'Text Only'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex items-center justify-center pt-4">
        <button
          onClick={handleStart}
          className="group relative px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-base transition-all duration-300 shadow-xl shadow-indigo-950/60 flex items-center gap-3 cursor-pointer hover:scale-105"
        >
          <span>Begin Mock Interview</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
        </button>
      </div>
    </div>
  );
};
