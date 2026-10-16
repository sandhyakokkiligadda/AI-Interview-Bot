export type AvatarState = 'idle' | 'speaking' | 'listening' | 'waiting' | 'thinking' | 'encouraging' | 'completed';

export type SupportedLanguage = 'English' | 'Telugu' | 'Hindi' | 'Tamil' | 'Kannada' | 'Malayalam';

export type PerformanceRating = 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';

export type InterviewSystemState =
  | 'READY'
  | 'CAMERA_CHECK'
  | 'INTERVIEWING'
  | 'ASKING_QUESTION'
  | 'WAITING_FOR_ANSWER'
  | 'SUBMITTING_ANSWER'
  | 'EVALUATING_ANSWER'
  | 'SPEAKING_FEEDBACK'
  | 'NEXT_QUESTION'
  | 'FINAL_REPORT'
  | 'PAUSED'
  | 'TERMINATED'
  | 'COMPLETED';

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'candidate';
  senderName: string;
  text: string;
  type: 'question' | 'answer' | 'feedback' | 'intro';
  score?: number;
  timestamp: string;
}

export type AvatarStyle = 'eilik' | 'elena' | 'priya' | 'alex';

export interface InterviewConfig {
  candidateName: string;
  interviewType: string;
  jobRole: string;
  experienceLevel: string;
  difficulty: string;
  durationMinutes: number;
  language: SupportedLanguage;
  interviewMode: 'voice' | 'text' | 'voice_and_text';
  enableHints: boolean;
  enableCoding: boolean;
  companyPreset?: string;
  resumeText?: string;
  jobDescription?: string;
  totalQuestions: number;
  voiceSpeed: number;
  avatarStyle?: AvatarStyle;
}

export interface InterviewSession {
  id: string;
  candidate_name: string;
  interview_type: string;
  job_role: string;
  experience_level: string;
  difficulty: string;
  duration_minutes: number;
  language: SupportedLanguage;
  interview_mode: string;
  enable_hints: boolean;
  enable_coding: boolean;
  company_preset: string;
  status: string;
  current_question_index: number;
  total_questions: number;
  proctoring_violations?: number;
  is_terminated?: boolean;
  termination_reason?: string;
  created_at: string;
  introduction_message?: string;
}

export interface TestCase {
  input: string;
  expected: string;
}

export interface QuestionData {
  id: string;
  interview_id: string;
  question_index: number;
  question_text: string;
  question_type: string;
  language: string;
  expected_concepts?: string[];
  hints?: string;
  is_follow_up: boolean;
  code_starter?: string;
  test_cases?: TestCase[];
  is_last_question: boolean;
  total_questions: number;
}

export interface EvaluationData {
  id: string;
  question_id: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  problem_solving_score: number;
  relevance_score: number;
  confidence_score: number;
  feedback: string;
  strengths?: string;
  areas_for_improvement?: string;
  missing_concepts?: string[];
  mistakes_identified?: string[];
  suggested_answer?: string;
  follow_up_suggested?: string;
  next_action: string;
}

export interface QuestionFeedbackDetail {
  question_index: number;
  question_text: string;
  question_type: string;
  candidate_answer: string;
  code_answer?: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  problem_solving_score: number;
  relevance_score: number;
  confidence_score: number;
  feedback: string;
  strengths?: string;
  areas_for_improvement?: string;
  missing_concepts?: string[];
  mistakes_identified?: string[];
  suggested_answer?: string;
}

export interface ReportData {
  id: string;
  interview_id: string;
  candidate_name: string;
  job_role: string;
  interview_type: string;
  difficulty: string;
  language: string;
  overall_score: number;
  technical_score: number;
  communication_score: number;
  problem_solving_score: number;
  relevance_score: number;
  confidence_clarity_score: number;
  performance_rating: PerformanceRating;
  summary: string;
  strengths: string[];
  improvements: string[];
  missing_concepts: string[];
  mistakes_identified: string[];
  recommendations: string[];
  recommended_topics: string[];
  is_terminated?: boolean;
  termination_reason?: string;
  proctoring_violations?: number;
  questions_detail: QuestionFeedbackDetail[];
  completed_at?: string;
}

export interface HistoryItem {
  id: string;
  candidate_name: string;
  job_role: string;
  interview_type: string;
  difficulty: string;
  language: string;
  overall_score: number;
  status: string;
  performance_rating?: PerformanceRating;
  is_terminated?: boolean;
  termination_reason?: string;
  proctoring_violations?: number;
  total_questions: number;
  answered_questions: number;
  created_at: string;
  completed_at?: string;
}

export interface ResumeParseResult {
  skills: string[];
  experience_years?: string;
  key_projects: string[];
  suggested_roles: string[];
  summary: string;
}
