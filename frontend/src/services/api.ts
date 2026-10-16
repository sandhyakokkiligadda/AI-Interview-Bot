import {
  InterviewConfig,
  InterviewSession,
  QuestionData,
  EvaluationData,
  ReportData,
  HistoryItem,
  ResumeParseResult
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8005/api';

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

    if (!res.ok) {
      throw new Error(`Failed to create interview session: ${res.statusText}`);
    }
    return res.json();
  },

  async getNextQuestion(interviewId: string, language?: string): Promise<QuestionData> {
    const res = await fetch(`${API_BASE_URL}/interviews/${interviewId}/next-question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: language || null })
    });

    if (!res.ok) {
      throw new Error(`Failed to retrieve next question: ${res.statusText}`);
    }
    return res.json();
  },

  async submitAnswer(
    interviewId: string,
    questionId: string,
    transcriptText: string,
    codeText?: string,
    durationSeconds: number = 0,
    inputMethod: 'voice' | 'text' = 'voice'
  ): Promise<EvaluationData> {
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

    if (!res.ok) {
      throw new Error(`Failed to submit answer: ${res.statusText}`);
    }
    return res.json();
  },

  async completeInterview(interviewId: string): Promise<ReportData> {
    const res = await fetch(`${API_BASE_URL}/interviews/${interviewId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Failed to complete interview: ${res.statusText}`);
    }
    return res.json();
  },

  async terminateInterview(
    interviewId: string,
    violations: number = 3,
    reason: string = 'Terminated due to repeated tab switching'
  ): Promise<ReportData> {
    const res = await fetch(`${API_BASE_URL}/interviews/${interviewId}/terminate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        termination_reason: reason,
        proctoring_violations: violations
      })
    });

    if (!res.ok) {
      throw new Error(`Failed to terminate interview: ${res.statusText}`);
    }
    return res.json();
  },

  async getReport(interviewId: string): Promise<ReportData> {
    const res = await fetch(`${API_BASE_URL}/interviews/${interviewId}/report`);
    if (!res.ok) {
      throw new Error(`Failed to fetch report: ${res.statusText}`);
    }
    return res.json();
  },

  async getHistory(): Promise<HistoryItem[]> {
    const res = await fetch(`${API_BASE_URL}/interviews/history`);
    if (!res.ok) {
      throw new Error(`Failed to fetch interview history: ${res.statusText}`);
    }
    return res.json();
  },

  async parseResume(resumeText: string): Promise<ResumeParseResult> {
    const res = await fetch(`${API_BASE_URL}/parse-resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume_text: resumeText })
    });

    if (!res.ok) {
      throw new Error(`Failed to parse resume: ${res.statusText}`);
    }
    return res.json();
  }
};
