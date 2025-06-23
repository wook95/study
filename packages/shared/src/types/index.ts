// Supabase 자동 생성 타입 (나중에 추가될 예정)
// export type { Database } from './database.js';

// 공통 타입 정의
export interface Study {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  daily_goal_hours?: number;
  category?: string;
  created_at: string;
}

export interface Todo {
  id: string;
  study_id: string;
  date: string;
  content: string;
  is_completed: boolean;
  completed_at?: string;
}

export interface DailyRecord {
  id: string;
  study_id: string;
  date: string;
  is_completed: boolean;
  completed_at?: string;
  notes?: string;
}
