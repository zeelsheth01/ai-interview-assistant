import api from "../api/api";

export interface MockInterviewTurn {
  id: number;
  turn_number: number;
  category: string;
  question: string;
  candidate_response: string | null;
  score: number | null;
  feedback_positive: string | null;
  feedback_missing: string | null;
  feedback_improvements: string | null;
  expected_key_points: string[];
  answered_at?: string | null;
}

export interface MockInterviewSession {
  id: string;
  job_role: string;
  technologies: string[];
  interview_type: string;
  difficulty: string;
  duration_minutes: number;
  status: "in_progress" | "completed" | "terminated";
  start_time: string | null;
  end_time: string | null;
  turns: MockInterviewTurn[];
  report_id?: number | null;
  created_at: string | null;
}

export interface RoadmapItem {
  phase: string;
  title: string;
  description: string;
  action_items?: string[];
}

export interface MockInterviewReport {
  id: number;
  session_id: string;
  job_role: string;
  overall_score: number;
  total_questions: number;
  correct_count: number;
  partially_correct_count: number;
  incorrect_count: number;
  duration_seconds: number;
  category_scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  knowledge_gaps: string[];
  recommended_questions: string[];
  learning_roadmap: RoadmapItem[];
  summary: string;
  turns: MockInterviewTurn[];
  created_at: string | null;
}

export interface CreateSessionPayload {
  job_role: string;
  technologies: string[];
  interview_type: string;
  difficulty: string;
  duration_minutes: number;
}

export interface RespondResponse {
  evaluation: {
    score: number;
    feedback_positive: string;
    feedback_missing: string;
    feedback_improvements: string;
    expected_key_points: string[];
  };
  next_turn: MockInterviewTurn;
  turn_completed: number;
}

export const mockInterviewApi = {
  createSession: async (data: CreateSessionPayload): Promise<MockInterviewSession> => {
    const res = await api.post("/mock-interview/sessions", data);
    return res.data;
  },

  getSessions: async (): Promise<MockInterviewSession[]> => {
    const res = await api.get("/mock-interview/sessions");
    return res.data;
  },

  getSession: async (sessionId: string): Promise<MockInterviewSession> => {
    const res = await api.get(`/mock-interview/sessions/${sessionId}`);
    return res.data;
  },

  respondToQuestion: async (sessionId: string, response: string): Promise<RespondResponse> => {
    const res = await api.post(`/mock-interview/sessions/${sessionId}/respond`, { response });
    return res.data;
  },

  completeInterview: async (sessionId: string): Promise<MockInterviewReport> => {
    const res = await api.post(`/mock-interview/sessions/${sessionId}/complete`);
    return res.data;
  },

  getReport: async (sessionId: string): Promise<MockInterviewReport> => {
    const res = await api.get(`/mock-interview/sessions/${sessionId}/report`);
    return res.data;
  },
};
