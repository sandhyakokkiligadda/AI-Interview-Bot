import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  Languages,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldAlert,
  Bot,
  User,
  MessageSquare,
  Volume2,
  HelpCircle
} from 'lucide-react';
import {
  InterviewSession,
  QuestionData,
  EvaluationData,
  ReportData,
  AvatarState,
  SupportedLanguage,
  InterviewSystemState,
  ChatMessage
} from '../../types';
import { api } from '../../services/api';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { EilikRobotAvatar } from '../Avatar/EilikRobotAvatar';
import { QuestionCard } from './QuestionCard';
import { AnswerControls } from './AnswerControls';
import { CodingEditor } from './CodingEditor';
import { CandidateWebcamPanel } from './CandidateWebcamPanel';
import { TabSwitchProctor } from './TabSwitchProctor';

interface LiveInterviewRoomProps {
  session: InterviewSession;
  candidateStream: MediaStream | null;
  voiceSpeed?: number;
  onFinishInterview: (report: ReportData) => void;
  onExitInterview: () => void;
}

export const LiveInterviewRoom: React.FC<LiveInterviewRoomProps> = ({
  session,
  candidateStream,
  voiceSpeed = 1.0,
  onFinishInterview,
  onExitInterview
}) => {
  // System State Machine
  const [systemState, setSystemState] = useState<InterviewSystemState>('INTERVIEWING');
  const [avatarState, setAvatarState] = useState<AvatarState>('speaking');
  const [visemeIntensity, setVisemeIntensity] = useState<number>(0);

  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(session.language);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Silence waiting detection (take your time banner)
  const [answeringTime, setAnsweringTime] = useState<number>(0);
  const [isSilenceWaiting, setIsSilenceWaiting] = useState<boolean>(false);

  // Proctoring Violations
  const [violationsCount, setViolationsCount] = useState<number>(0);
  const [isTerminated, setIsTerminated] = useState<boolean>(false);

  // Total session timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Past Q&A history
  const [pastQAList, setPastQAList] = useState<
    Array<{ question: QuestionData; answerText: string; evaluation?: EvaluationData }>
  >([]);

  // Live Interview Dialogue Chat Messages & Active Tab
  const [activeLeftTab, setActiveLeftTab] = useState<'chat' | 'details'>('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Pending action triggered when Eilik finishes speaking
  const pendingActionRef = useRef<'PROCEED_TO_NEXT_QUESTION' | 'FINISH_INTERVIEW' | null>(null);

  // Code editor answer
  const [currentCodeAnswer, setCurrentCodeAnswer] = useState<string>('');

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSubmitting]);

  // Handle interview completion
  const handleCompleteSession = async () => {
    cleanupMediaTracks();
    try {
      const report = await api.completeInterview(session.id);
      onFinishInterview(report);
    } catch (err) {
      console.error('Error completing interview session:', err);
    }
  };

  // Load and ask the next question sequentially
  const loadAndAskNextQuestion = async () => {
    try {
      setIsLoadingQuestion(true);
      setSystemState('NEXT_QUESTION');
      const nextQ = await api.getNextQuestion(session.id, currentLanguage);
      setCurrentQuestion(nextQ);
      setQuestionIndex(nextQ.question_index);
      if (nextQ.code_starter) {
        setCurrentCodeAnswer(nextQ.code_starter);
      }
      setIsLoadingQuestion(false);

      // Append next question to live chat
      const qMsg: ChatMessage = {
        id: `q-${nextQ.id}`,
        sender: 'ai',
        senderName: 'Eilik Robot',
        text: nextQ.question_text,
        type: 'question',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, qMsg]);

      // Speak next question
      setSystemState('ASKING_QUESTION');
      setAvatarState('speaking');
      pendingActionRef.current = null;
      speak(nextQ.question_text);
    } catch (err) {
      console.error('Error fetching next question:', err);
      handleCompleteSession();
    }
  };

  // Speech synthesis hook for Eilik
  const {
    isSpeaking,
    speak,
    stop: stopSpeaking,
    pause: pauseSpeaking,
    resume: resumeSpeaking
  } = useSpeechSynthesis({
    language: currentLanguage,
    voiceSpeed,
    onSpeakingStart: () => {
      setAvatarState('speaking');
    },
    onSpeakingEnd: () => {
      setVisemeIntensity(0);
      if (pendingActionRef.current === 'PROCEED_TO_NEXT_QUESTION') {
        pendingActionRef.current = null;
        loadAndAskNextQuestion();
      } else if (pendingActionRef.current === 'FINISH_INTERVIEW') {
        pendingActionRef.current = null;
        handleCompleteSession();
      } else {
        // Normal question speaking ended: Enter patient WAITING state
        setAvatarState('waiting');
        setSystemState('WAITING_FOR_ANSWER');
      }
    },
    onSpeakingTick: (intensity) => setVisemeIntensity(intensity)
  });

  // Speech recognition hook for Candidate
  const {
    isListening,
    transcript,
    setTranscript,
    interimTranscript,
    audioVolume,
    permissionError,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    language: currentLanguage,
    onError: (err) => console.warn('Recognition notice:', err)
  });

  // Clean media streams on teardown
  const cleanupMediaTracks = () => {
    if (candidateStream) {
      candidateStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
    }
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
      cleanupMediaTracks();
    };
  }, []);

  // Sync avatar listening state when mic active
  useEffect(() => {
    if (isListening) {
      setAvatarState('listening');
    } else if (avatarState === 'listening') {
      setAvatarState('waiting');
    }
  }, [isListening]);

  // Timers and silence detector
  useEffect(() => {
    if (isPaused || isTerminated) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setAnsweringTime((prev) => {
        const next = prev + 1;
        // After 15 seconds without an answer, show patient waiting reminder
        if (next >= 15 && !transcript.trim()) {
          setIsSilenceWaiting(true);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, isTerminated, transcript]);

  // Initial Question Fetch & Intro
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        setIsLoadingQuestion(true);
        const qData = await api.getNextQuestion(session.id, currentLanguage);
        if (!isMounted) return;

        setCurrentQuestion(qData);
        setQuestionIndex(qData.question_index);
        if (qData.code_starter) {
          setCurrentCodeAnswer(qData.code_starter);
        }
        setIsLoadingQuestion(false);

        // Append initial question to chat
        const initialMsg: ChatMessage = {
          id: `q-0`,
          sender: 'ai',
          senderName: 'Eilik Robot',
          text: qData.question_text,
          type: 'question',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages([initialMsg]);

        // Speak the opening question clearly
        setSystemState('ASKING_QUESTION');
        setAvatarState('speaking');
        pendingActionRef.current = null;
        speak(qData.question_text);
      } catch (err) {
        console.error('Initial question fetch failed:', err);
        setIsLoadingQuestion(false);
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [session.id]);

  const handleLanguageChange = async (newLang: SupportedLanguage) => {
    setCurrentLanguage(newLang);
    if (currentQuestion) {
      stopSpeaking();
      try {
        const qData = await api.getNextQuestion(session.id, newLang);
        setCurrentQuestion(qData);

        const langMsg: ChatMessage = {
          id: `q-lang-${Date.now()}`,
          sender: 'ai',
          senderName: 'Eilik Robot',
          text: qData.question_text,
          type: 'question',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages((prev) => [...prev, langMsg]);

        setSystemState('ASKING_QUESTION');
        setAvatarState('speaking');
        pendingActionRef.current = null;
        speak(qData.question_text);
      } catch (err) {
        console.error('Language switch error:', err);
      }
    }
  };

  const handleRepeatQuestion = () => {
    if (currentQuestion) {
      stopListening();
      setSystemState('ASKING_QUESTION');
      setAvatarState('speaking');
      pendingActionRef.current = null;
      speak(currentQuestion.question_text);
    }
  };

  // Submit Answer - Strictly Candidate-Triggered
  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;
    const currentSpoken = (transcript + (interimTranscript ? ' ' + interimTranscript : '')).trim();
    const finalAnswer = currentSpoken || currentCodeAnswer.trim();
    if (!finalAnswer) return; // Disallow empty submit

    stopListening();
    stopSpeaking();
    setIsSubmitting(true);
    setSystemState('EVALUATING_ANSWER');
    setAvatarState('thinking');

    // Add candidate answer to chat
    const candMsg: ChatMessage = {
      id: `cand-${Date.now()}`,
      sender: 'candidate',
      senderName: session.candidate_name || 'Candidate',
      text: finalAnswer,
      type: 'answer',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages((prev) => [...prev, candMsg]);

    try {
      // 1. Submit answer & receive evaluation
      const evalResult = await api.submitAnswer(
        session.id,
        currentQuestion.id,
        finalAnswer,
        currentQuestion.question_type === 'Coding' ? currentCodeAnswer : undefined,
        answeringTime,
        currentSpoken ? 'voice' : 'text'
      );

      // Record in history
      setPastQAList((prev) => [
        ...prev,
        {
          question: currentQuestion,
          answerText: finalAnswer,
          evaluation: evalResult
        }
      ]);

      // 2. Build intelligent reaction based on evaluation score & feedback
      const score = evalResult.overall_score;
      let sentimentIntro = 'Thank you for your answer.';
      if (score >= 85) {
        sentimentIntro = 'Excellent response! That was very well articulated.';
      } else if (score >= 70) {
        sentimentIntro = 'Good response. You highlighted the core points effectively.';
      } else if (score >= 50) {
        sentimentIntro = 'Fair attempt. You touched on the main ideas.';
      }

      const firstSentence = evalResult.feedback
        ? evalResult.feedback.split('.')[0] + '.'
        : '';

      const isLast = currentQuestion.is_last_question || questionIndex + 1 >= session.total_questions;
      const transitionPhrase = isLast
        ? 'That concludes our final question. Great job completing the mock interview!'
        : 'Now, let us move on to the next question.';

      const aiFeedbackSpeech = `${sentimentIntro} ${firstSentence} ${transitionPhrase}`.trim();

      // Add feedback to chat
      const fbMsg: ChatMessage = {
        id: `ai-fb-${Date.now()}`,
        sender: 'ai',
        senderName: 'Eilik Robot',
        text: aiFeedbackSpeech,
        type: 'feedback',
        score: evalResult.overall_score,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, fbMsg]);

      // Reset candidate answer input & silence timer
      resetTranscript();
      setAnsweringTime(0);
      setIsSilenceWaiting(false);
      setIsSubmitting(false);

      // 3. Speak feedback and queue next question
      setAvatarState('encouraging');
      setSystemState('SPEAKING_FEEDBACK');

      if (isLast) {
        pendingActionRef.current = 'FINISH_INTERVIEW';
      } else {
        pendingActionRef.current = 'PROCEED_TO_NEXT_QUESTION';
      }

      speak(aiFeedbackSpeech);
    } catch (err) {
      console.error('Answer submission error:', err);
      setIsSubmitting(false);
      setAvatarState('waiting');
      setSystemState('WAITING_FOR_ANSWER');
    }
  };

  const handleSkipQuestion = async () => {
    if (!currentQuestion) return;
    stopListening();
    stopSpeaking();
    resetTranscript();
    setAnsweringTime(0);
    setIsSilenceWaiting(false);

    const isLast = currentQuestion.is_last_question || questionIndex + 1 >= session.total_questions;
    if (isLast) {
      cleanupMediaTracks();
      const finalReport = await api.completeInterview(session.id);
      onFinishInterview(finalReport);
    } else {
      try {
        setIsLoadingQuestion(true);
        const nextQ = await api.getNextQuestion(session.id, currentLanguage);
        setCurrentQuestion(nextQ);
        setQuestionIndex(nextQ.question_index);
        setIsLoadingQuestion(false);

        const qMsg: ChatMessage = {
          id: `q-skip-${nextQ.id}`,
          sender: 'ai',
          senderName: 'Eilik Robot',
          text: nextQ.question_text,
          type: 'question',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages((prev) => [...prev, qMsg]);

        setSystemState('ASKING_QUESTION');
        setAvatarState('speaking');
        pendingActionRef.current = null;
        speak(nextQ.question_text);
      } catch (err) {
        console.error('Error skipping question:', err);
      }
    }
  };

  // 3-Strike Tab Switch Violation Handler
  const handleTabSwitchViolation = (count: number) => {
    setViolationsCount(count);
  };

  const handleTabSwitchTermination = async (reason: string) => {
    setIsTerminated(true);
    setSystemState('TERMINATED');
    stopSpeaking();
    stopListening();
    cleanupMediaTracks();

    try {
      const partialReport = await api.terminateInterview(session.id, 3, reason);
      onFinishInterview(partialReport);
    } catch (err) {
      console.error('Failed to submit termination report:', err);
      const fallbackReport = await api.completeInterview(session.id);
      onFinishInterview(fallbackReport);
    }
  };

  const progressPercent = Math.min(100, Math.round(((questionIndex + 1) / session.total_questions) * 100));

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col p-3 sm:p-6 relative">
      {/* Tab Switch Anti-Cheating Proctor */}
      <TabSwitchProctor
        isActive={!isPaused && !isTerminated}
        onViolation={handleTabSwitchViolation}
        onTerminate={handleTabSwitchTermination}
        onPauseTimer={(p) => setIsPaused(p)}
      />

      {/* Top Header Bar */}
      <header className="w-full flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-teal-400 animate-pulse" />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>{session.job_role}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-950/80 border border-teal-700/60 text-teal-300 font-normal hidden sm:inline">
                {session.interview_type}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Candidate: <span className="text-slate-200 font-medium">{session.candidate_name}</span> • Level:{' '}
              <span className="text-slate-200 font-medium">{session.experience_level}</span>
            </p>
          </div>
        </div>

        {/* Header Right: Progress, Language, End button */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end text-xs">
            <span className="text-slate-400 font-mono">
              Question {questionIndex + 1} of {session.total_questions} ({progressPercent}%)
            </span>
            <div className="w-28 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <Languages className="w-3.5 h-3.5 text-teal-400" />
            <span>{currentLanguage}</span>
          </div>

          <button
            onClick={() => setShowExitModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-xs font-semibold transition cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">End Interview</span>
          </button>
        </div>
      </header>

      {/* Main Two-Panel Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel — AI Interviewer (Eilik Robot + Chat & Question Stream) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Eilik Robot Card */}
          <EilikRobotAvatar
            state={avatarState}
            visemeIntensity={visemeIntensity}
            robotName="Eilik AI Coach"
            className="w-full"
          />

          {/* Interviewer Voice Profile Badge */}
          <div className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/90 border border-teal-500/30 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-slate-300 font-medium">Interviewer Voice:</span>
              <span className="text-teal-300 font-semibold">Fliki Studio Voice (Jenny Neural)</span>
            </div>
            <a
              href="/Fliki_sample.mp3"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
            >
              <Volume2 className="w-3 h-3" />
              <span>Fliki Sample</span>
            </a>
          </div>

          {/* Tab Switcher: Live Interview Chat vs Question Rubrics */}
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveLeftTab('chat')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeLeftTab === 'chat'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Live Interview Chat ({chatMessages.length})</span>
              </button>

              <button
                onClick={() => setActiveLeftTab('details')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeLeftTab === 'details'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Question Rubrics & Tips</span>
              </button>
            </div>

            {currentQuestion && (
              <button
                onClick={handleRepeatQuestion}
                disabled={isSpeaking}
                title="Speak current question using text-to-speech"
                className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 transition cursor-pointer disabled:opacity-50"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-pulse text-cyan-300' : ''}`} />
                <span className="font-medium">Play Voice</span>
              </button>
            )}
          </div>

          {/* View Tab: Chat vs QuestionCard */}
          {activeLeftTab === 'chat' ? (
            <div className="flex flex-col gap-3">
              {/* Active Question Banner */}
              {currentQuestion && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-950/40 to-slate-900/80 border border-teal-500/30 flex items-start justify-between gap-3 shadow-md">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-teal-950 text-teal-300 border border-teal-800">
                        Active Question {questionIndex + 1}/{session.total_questions}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {currentQuestion.question_type}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-snug">
                      {currentQuestion.question_text}
                    </p>
                  </div>

                  <button
                    onClick={handleRepeatQuestion}
                    disabled={isSpeaking}
                    title="Repeat question audio"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 hover:text-teal-300 transition shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse text-cyan-300' : ''}`} />
                  </button>
                </div>
              )}

              {/* Chat Dialogue Stream */}
              <div className="w-full rounded-2xl glass-panel p-4 flex flex-col gap-3 max-h-[350px] overflow-y-auto border border-slate-800 shadow-xl">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 text-xs ${
                      msg.sender === 'ai' ? 'items-start' : 'items-start flex-row-reverse'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                        msg.sender === 'ai'
                          ? 'bg-teal-950/90 border-teal-500/40 text-teal-300'
                          : 'bg-indigo-950/90 border-indigo-500/40 text-indigo-300'
                      }`}
                    >
                      {msg.sender === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-3 space-y-1.5 shadow-md ${
                        msg.sender === 'ai'
                          ? msg.type === 'feedback'
                            ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-100'
                            : 'bg-slate-900/90 border border-teal-500/20 text-slate-100'
                          : 'bg-indigo-950/60 border border-indigo-500/30 text-indigo-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 border-b border-slate-800/60 pb-1">
                        <span className="font-semibold text-slate-300">{msg.senderName}</span>
                        <div className="flex items-center gap-1.5">
                          {msg.score !== undefined && (
                            <span className="px-1.5 py-0.2 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 font-mono">
                              Score: {msg.score}/100
                            </span>
                          )}
                          <span>{msg.timestamp}</span>
                          {msg.sender === 'ai' && (
                            <button
                              onClick={() => speak(msg.text)}
                              title="Listen to this message"
                              className="hover:text-teal-300 transition cursor-pointer p-0.5"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}

                {isSubmitting && (
                  <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/20 border border-amber-500/20 p-2.5 rounded-xl">
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <span>Eilik is evaluating your response against technical rubrics...</span>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>
          ) : (
            <>
              {isLoadingQuestion || !currentQuestion ? (
                <div className="w-full rounded-2xl glass-panel p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                  <div className="w-7 h-7 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Eilik is loading your question in {currentLanguage}...</span>
                </div>
              ) : (
                <QuestionCard
                  question={currentQuestion}
                  onRepeatQuestion={handleRepeatQuestion}
                  isSpeaking={isSpeaking}
                  enableHints={session.enable_hints}
                  currentLanguage={currentLanguage}
                  onLanguageChange={handleLanguageChange}
                />
              )}
            </>
          )}
        </div>

        {/* Right Panel — Candidate (Live Webcam Feed + Answer Controls + Code IDE) */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Candidate Webcam Feed Panel */}
          <CandidateWebcamPanel
            stream={candidateStream}
            candidateName={session.candidate_name}
            violationsCount={violationsCount}
            isListening={isListening}
          />

          {/* Coding Editor if question is coding type */}
          {currentQuestion?.question_type === 'Coding' && (
            <CodingEditor
              initialCode={currentQuestion.code_starter || '# Write solution here\n'}
              testCases={currentQuestion.test_cases}
              onCodeChange={(code) => setCurrentCodeAnswer(code)}
            />
          )}

          {/* Candidate Answer Controls with Patient Waiting indicator */}
          <AnswerControls
            isListening={isListening}
            transcript={transcript}
            interimTranscript={interimTranscript}
            onTranscriptChange={(val) => setTranscript(val)}
            onStartListening={startListening}
            onStopListening={stopListening}
            onResetTranscript={resetTranscript}
            onSubmitAnswer={handleSubmitAnswer}
            onSkipQuestion={handleSkipQuestion}
            onTogglePause={() => {
              if (isPaused) {
                setIsPaused(false);
                resumeSpeaking();
              } else {
                setIsPaused(true);
                pauseSpeaking();
                stopListening();
              }
            }}
            isPaused={isPaused}
            isSubmitting={isSubmitting}
            permissionError={permissionError}
            audioVolume={audioVolume}
            answeringTimeSeconds={answeringTime}
            isSilenceWaiting={isSilenceWaiting}
          />
        </div>
      </div>

      {/* Early Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel-glow p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-100">Conclude Interview Early?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to exit? All answers submitted so far will be evaluated and your performance
              scorecard compiled.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition cursor-pointer"
              >
                Continue Interview
              </button>
              <button
                onClick={async () => {
                  setShowExitModal(false);
                  stopListening();
                  stopSpeaking();
                  cleanupMediaTracks();
                  const report = await api.completeInterview(session.id);
                  onFinishInterview(report);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition shadow-lg shadow-rose-950/40 cursor-pointer"
              >
                Conclude & View Scorecard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
