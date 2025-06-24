import { APIClient, createAuthApi, createSupabaseClient } from '@shared/core';

// 환경변수 체크
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase 환경변수가 설정되지 않았습니다. .env 파일을 확인해주세요.'
  );
}

// Supabase 클라이언트 생성
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// API 클라이언트 생성
export const api = new APIClient(supabase);

// Auth API 생성
export const authApi = createAuthApi(supabase); 