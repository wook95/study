import { authApi } from "@/lib/supabase";
import { useAuthStore } from "@shared/core";
import { useEffect } from "react";

export interface UseAuthReturn {
  user: any;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const { user, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // 초기 세션 확인
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const session = await authApi.getSession();
        
        if (session?.session?.user) {
          setUser(session.session.user);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = authApi.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await authApi.signIn({ email, password });
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authApi.signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isLoading,
    signIn,
    signOut,
  };
} 