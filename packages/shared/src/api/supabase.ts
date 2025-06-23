import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// 환경변수는 각 앱에서 주입받아야 함
export const createSupabaseClient = (url: string, anonKey: string) => {
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
};

// 클라이언트 타입 정의
export type SupabaseClient = ReturnType<typeof createSupabaseClient>; 