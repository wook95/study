import type { TodoInsert } from '../types';
import type { SupabaseClient } from './supabase';

export class TodosAPI {
  constructor(private supabase: SupabaseClient) {}

  /**
   * 특정 날짜의 투두 목록 조회
   */
  async getTodosByDate(date: string, studyId?: string) {
    let query = this.supabase
      .from('todos')
      .select('*')
      .eq('date', date);

    if (studyId) {
      query = query.eq('study_id', studyId);
    }

    const { data, error } = await query.order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * 특정 기간의 투두 목록 조회
   */
  async getTodosByDateRange(startDate: string, endDate: string, studyId?: string) {
    let query = this.supabase
      .from('todos')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);

    if (studyId) {
      query = query.eq('study_id', studyId);
    }

    const { data, error } = await query.order('date', { ascending: true });

    if (error) throw error;
    return data;
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
   * 투두 상태 토글 (완료/미완료)
   */
  async toggleTodo(id: string) {
    const { data: todo, error: fetchError } = await this.supabase
      .from('todos')
      .select('is_completed')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await this.supabase
      .from('todos')
      .update({ 
        is_completed: !todo.is_completed,
        completed_at: !todo.is_completed ? new Date().toISOString() : null
      })
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
   * 특정 스터디의 진행률 통계 조회
   */
  async getStudyProgress(studyId: string, startDate?: string, endDate?: string) {
    let query = this.supabase
      .from('todos')
      .select('*')
      .eq('study_id', studyId);

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const totalTodos = data.length;
    const completedTodos = data.filter(todo => todo.is_completed).length;
    const progressPercentage = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

    return {
      totalTodos,
      completedTodos,
      progressPercentage,
      activeDays: new Set(data.map(todo => todo.date)).size,
    };
  }

  /**
   * 연속 달성일 계산
   */
  async getStreakCount(studyId: string) {
    const { data, error } = await this.supabase
      .from('todos')
      .select('date, is_completed')
      .eq('study_id', studyId)
      .order('date', { ascending: false });

    if (error) throw error;

    // 날짜별로 그룹화하여 완료 여부 확인
    const dateCompletionMap = new Map<string, boolean>();
    
    for (const todo of data) {
      const date = todo.date;
      const currentStatus = dateCompletionMap.get(date) || false;
      dateCompletionMap.set(date, currentStatus || todo.is_completed);
    }

    // 오늘부터 역순으로 연속 달성일 계산
    const today = new Date().toISOString().split('T')[0];
    let streakCount = 0;
    const currentDate = new Date(today);

    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      if (dateCompletionMap.has(dateStr) && dateCompletionMap.get(dateStr)) {
        streakCount++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (dateCompletionMap.has(dateStr)) {
        // 해당 날짜에 투두가 있었지만 완료하지 않음 - 연속 끊김
        break;
      } else {
        // 해당 날짜에 투두가 없음 - 하루 전으로 이동
        currentDate.setDate(currentDate.getDate() - 1);
      }

      // 무한 루프 방지 (1년 제한)
      if (streakCount > 365) break;
    }

    return streakCount;
  }

  /**
   * 주간 통계 조회
   */
  async getWeeklyStats(studyId: string, weekStartDate: string) {
    const weekStart = new Date(weekStartDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const startDateStr = weekStart.toISOString().split('T')[0];
    const endDateStr = weekEnd.toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('todos')
      .select('*')
      .eq('study_id', studyId)
      .gte('date', startDateStr)
      .lte('date', endDateStr);

    if (error) throw error;

    // 일별 통계 계산
    const dailyStats = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const dayTodos = data.filter(todo => todo.date === dateStr);
      const totalTodos = dayTodos.length;
      const completedTodos = dayTodos.filter(todo => todo.is_completed).length;
      
      dailyStats.push({
        date: dateStr,
        dayName: currentDate.toLocaleDateString('ko-KR', { weekday: 'short' }),
        totalTodos,
        completedTodos,
        completionRate: totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0,
      });
    }

    return dailyStats;
  }

  /**
   * 월간 통계 조회
   */
  async getMonthlyStats(studyId: string, year: number, month: number) {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    const startDateStr = monthStart.toISOString().split('T')[0];
    const endDateStr = monthEnd.toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('todos')
      .select('*')
      .eq('study_id', studyId)
      .gte('date', startDateStr)
      .lte('date', endDateStr);

    if (error) throw error;

    // 주별 통계 계산 (4-5주)
    const weeklyStats = [];
    const currentWeekStart = new Date(monthStart);
    
    // 월 첫째 주 시작일을 일요일로 맞춤
    while (currentWeekStart.getDay() !== 0) {
      currentWeekStart.setDate(currentWeekStart.getDate() - 1);
    }

    while (currentWeekStart <= monthEnd) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekStartStr = currentWeekStart.toISOString().split('T')[0];
      const weekEndStr = weekEnd.toISOString().split('T')[0];

      const weekTodos = data.filter(todo => 
        todo.date >= weekStartStr && todo.date <= weekEndStr
      );

      const totalTodos = weekTodos.length;
      const completedTodos = weekTodos.filter(todo => todo.is_completed).length;

      weeklyStats.push({
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        weekLabel: `${currentWeekStart.getDate()}일 주`,
        totalTodos,
        completedTodos,
        completionRate: totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0,
      });

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return weeklyStats;
  }
} 