import {
  InterviewConfig,
  InterviewSession,
  QuestionData,
  EvaluationData,
  ReportData,
  HistoryItem,
  ResumeParseResult
} from '../types';
import { localEngine } from './localInterviewEngine';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:8005/api'
    : '/api');

// Track if current session is running in local fallback mode
let isLocalSession = false;

export const api = {
  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  async createInterview(config: InterviewConfig): Promise<InterviewSession> {
    try {
      const payload = {
        candidate_name: config.candidateName || 'Candidate',
        interview_type: config.interviewType,
        job_role: config.jobRole,
        experience_level: config.experienceLevel,
        difficulty: config.difficulty,
        duration_minutes: config.durationMinutes,
        language: config.language,
        interview_mode: config.interviewMode,
        enable_hints: config.enableHints,
        enable_coding: config.enableCoding,
        company_preset: config.companyPreset || 'General Enterprise',
        resume_text: config.resumeText || null,
        job_description: config.jobDescription || null,
        total_questions: config.totalQuestions || 5
      };

      const res = await fetch(`${API_BASE_URL}/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        isLocalSession = false;
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend unavailable or network error. Starting interview using intelligent client-side simulation engine:', e);
    }

    // Seamless zero-fail fallback
    isLocalSession = true;
    return localEngine.createInterview(config);
  },

  async getNextQuestion(interviewId: string, language?: string): Promise<QuestionData> {
    if (!isLocalSession) {
      try {
        const res = await fetch(`${API_BASE_URL}/interviews/${interviewId}/next-question`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: language || null })
        });

        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend question fetch failed, falling back to local question engine:', e);
      }
    }

    return localEngine.getNextQuestion(interviewId, (language as any) || 'English');
  },

  async submitAnswer(
    interviewId: string,
    questionId: string,
    transcriptText: string,
    codeText?: string,
    durationSeconds: number = 0,
    inputMethod: 'voice' | 'text' = 'voice'
  ): Promise<EvaluationData> {
    if (!isLocalSession) {
      try {
        const payload = {
          question_id: questionId,
          transcript_text: transcriptText,
          code_text: codeText || null,
          duration_seconds: durationSeconds,
          input_method: inputMethod
        };

        const res = await fetch(`${API_BASE_URL}/interviews/${interviewId}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend evaluation failed, falling back to local evaluation engine:', e);
      }
    }

    return localEngine.submitAnswer(interviewId, questionId, transcriptText, codeText);
  },

  async completeInterview(interviewId: string): Promise<ReportData> {
    if (!isLocalSession) {
      try {
        const res = await fetch(`${API_BASE_URL}/interviews/${interviewId}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend completion failed, compiling local scorecard:', e);
      }
    }

    return localEngine.compileReport(interviewId, false);
  },

  async terminateInterview(
    interviewId: string,
    violations: number = 5,
    reason: string = 'Terminated due to repeated tab switching (5 violations)'
  ): Promise<ReportData> {
    if (!isLocalSession) {
      try {
        const res = await fetch(`${API_BASE_URL}/interviews/${interviewId}/terminate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            termination_reason: reason,
            proctoring_violations: violations
          })
        });

        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend termination record failed, compiling local scorecard:', e);
      }
    }

    return localEngine.compileReport(interviewId, true, reason, violations);
  },

  async getReport(interviewId: string): Promise<ReportData> {
    if (!isLocalSession) {
      try {
        const res = await fetch(`${API_BASE_URL}/interviews/${interviewId}/report`);
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend report fetch failed, using local report:', e);
      }
    }

    return localEngine.compileReport(interviewId, false);
  },

  async getHistory(): Promise<HistoryItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/interviews/history`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Return empty history if offline
    }
    return [];
  },

  async parseResume(resumeText: string): Promise<ResumeParseResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/parse-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText })
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend resume parser unavailable, using local parser:', e);
    }

    return localEngine.parseResume(resumeText);
  }
};
