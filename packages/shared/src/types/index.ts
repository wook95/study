// Supabase 자동 생성 타입
import type { Database } from './database';
export type { Database } from './database';

// 데이터베이스 테이블 타입 추출
export type Study = Database['public']['Tables']['studies']['Row'];
export type StudyInsert = Database['public']['Tables']['studies']['Insert'];
export type StudyUpdate = Database['public']['Tables']['studies']['Update'];

export type Todo = Database['public']['Tables']['todos']['Row'];
export type TodoInsert = Database['public']['Tables']['todos']['Insert'];
export type TodoUpdate = Database['public']['Tables']['todos']['Update'];

export type DailyRecord = Database['public']['Tables']['daily_records']['Row'];
export type DailyRecordInsert = Database['public']['Tables']['daily_records']['Insert'];
export type DailyRecordUpdate = Database['public']['Tables']['daily_records']['Update'];

// 추가 유틸리티 타입
export type StudyWithStats = Study & {
  total_todos: number;
  completed_todos: number;
  completion_rate: number;
};
