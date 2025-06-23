// Supabase 클라이언트
export * from './supabase';

// API 클래스들
export * from './studies';
export * from './todos';

import { StudiesAPI } from './studies';
// 통합 API 클라이언트
import type { SupabaseClient } from './supabase';
import { TodosAPI } from './todos';

export class APIClient {
  public studies: StudiesAPI;
  public todos: TodosAPI;

  constructor(supabase: SupabaseClient) {
    this.studies = new StudiesAPI(supabase);
    this.todos = new TodosAPI(supabase);
  }
}
