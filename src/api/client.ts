/**
 * Single integration boundary for the future AIGMA backend.
 * Screens consume domain-shaped data; replace these demo implementations with
 * authenticated HTTP calls without changing presentation components.
 */
export type ApiResult<T> = { data: T; source: 'demo' | 'remote' };

export interface DashboardSummary {
  overallScore: number;
  targetScore: number;
  streakDays: number;
  studyMinutesThisWeek: number;
}

export interface PracticeResponse {
  questionId: string;
  text?: string;
  recordingUri?: string;
}

const wait = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));

export const api = {
  async getDashboard(): Promise<ApiResult<DashboardSummary>> {
    await wait(150);
    return { data: { overallScore: 72, targetScore: 79, streakDays: 4, studyMinutesThisWeek: 168 }, source: 'demo' };
  },

  async submitPractice(response: PracticeResponse): Promise<ApiResult<{ submissionId: string; status: 'queued' }>> {
    await wait(250);
    return { data: { submissionId: `demo-${response.questionId}`, status: 'queued' }, source: 'demo' };
  },
};
