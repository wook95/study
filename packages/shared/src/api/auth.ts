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

// 환경에 따른 기본 URL 결정
const getBaseUrl = () => {
  // 프로덕션 환경에서는 환경변수 또는 기본 도메인 사용
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
      return window.location.origin;
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return window.location.origin;
    }
  }
  
  // 프로덕션 기본값
  return 'https://study-eungwon-dan-web.vercel.app';
};

export const createAuthApi = (supabase: SupabaseClient) => ({
  // 회원가입
  signUp: async ({ email, password, displayName }: SignUpData) => {
    const baseUrl = getBaseUrl();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
        emailRedirectTo: `${baseUrl}/verify-email`,
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
    const baseUrl = getBaseUrl();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/reset-password`,
    });
    if (error) throw error;
    return data;
  },

  // 이메일 확인
  resendConfirmation: async (email: string) => {
    const baseUrl = getBaseUrl();
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${baseUrl}/verify-email`,
      },
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