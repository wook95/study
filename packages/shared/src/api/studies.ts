import type { StudyInsert, StudyUpdate } from '../types';
import type { SupabaseClient } from './supabase';

export class StudiesAPI {
  constructor(private supabase: SupabaseClient) {}

  /**
   * 모든 스터디 목록 조회
   */
  async getStudies() {
    const { data, error } = await this.supabase
      .from('studies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * 특정 스터디 조회
   */
  async getStudy(id: string) {
    const { data, error } = await this.supabase
      .from('studies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 새 스터디 생성
   */
  async createStudy(study: StudyInsert) {
    const { data, error } = await this.supabase
      .from('studies')
      .insert(study)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 스터디 수정
   */
  async updateStudy(id: string, updates: StudyUpdate) {
    const { data, error } = await this.supabase
      .from('studies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 스터디 삭제
   */
  async deleteStudy(id: string) {
    const { error } = await this.supabase
      .from('studies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * 현재 진행 중인 스터디 조회
   */
  async getActiveStudies() {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await this.supabase
      .from('studies')
      .select('*')
      .lte('start_date', today)
      .gte('end_date', today)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
} 