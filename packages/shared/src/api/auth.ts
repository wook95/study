import type { SupabaseClient } from './supabase';

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const createAuthApi = (supabase: SupabaseClient) => ({
  // 회원가입
  signUp: async ({ email, password, displayName }: SignUpData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
      },
    });

    if (error) throw error;
    return data;
  },

  // 로그인
  signIn: async ({ email, password }: SignInData) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // 로그아웃
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // 현재 세션 가져오기
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  },

  // 현재 유저 가져오기
  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data;
  },

  // 비밀번호 재설정 요청
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  },

  // 이메일 확인
  resendConfirmation: async (email: string) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) throw error;
    return data;
  },

  // 인증 상태 변경 리스너
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // 새 비밀번호 설정
  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },

  // 프로필 업데이트
  updateProfile: async (updates: { full_name?: string; avatar_url?: string }) => {
    const { error } = await supabase.auth.updateUser({
      data: updates,
    });
    if (error) throw error;
  },
}); 