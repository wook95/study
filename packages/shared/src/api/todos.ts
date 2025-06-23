import type { TodoInsert, TodoUpdate } from '../types';
import type { SupabaseClient } from './supabase';

export class TodosAPI {
  constructor(private supabase: SupabaseClient) {}

  /**
   * 특정 날짜의 투두 목록 조회
   */
  async getTodosByDate(studyId: string, date: string) {
    const { data, error } = await this.supabase
      .from('todos')
      .select('*')
      .eq('study_id', studyId)
      .eq('date', date)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * 오늘의 투두 목록 조회
   */
  async getTodaysTodos(studyId: string) {
    const today = new Date().toISOString().split('T')[0];
    return this.getTodosByDate(studyId, today);
  }

  /**
   * 새 투두 생성
   */
  async createTodo(todo: TodoInsert) {
    const { data, error } = await this.supabase
      .from('todos')
      .insert(todo)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 투두 완료/미완료 토글
   */
  async toggleTodo(id: string, isCompleted: boolean) {
    const updates: TodoUpdate = {
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    };

    const { data, error } = await this.supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 투두 수정
   */
  async updateTodo(id: string, updates: TodoUpdate) {
    const { data, error } = await this.supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 투두 삭제
   */
  async deleteTodo(id: string) {
    const { error } = await this.supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * 스터디의 투두 통계 조회
   */
  async getTodoStats(studyId: string) {
    const { data, error } = await this.supabase
      .from('todos')
      .select('is_completed')
      .eq('study_id', studyId);

    if (error) throw error;

    const total = data.length;
    const completed = data.filter(todo => todo.is_completed).length;
    const completion_rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total_todos: total,
      completed_todos: completed,
      completion_rate,
    };
  }

  /**
   * 특정 기간의 투두 목록 조회
   */
  async getTodosByDateRange(studyId: string, startDate: string, endDate: string) {
    const { data, error } = await this.supabase
      .from('todos')
      .select('*')
      .eq('study_id', studyId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }
} 