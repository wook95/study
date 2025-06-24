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
    let mounted = true;

    // 간단한 초기화
    const initAuth = async () => {
      try {
        const session = await authApi.getSession();
        if (mounted) {
          setUser(session?.session?.user || null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth error:", error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    // 인증 상태 변경 리스너
    const { data: { subscription } } = authApi.onAuthStateChange((event, session) => {
      if (mounted) {
        setUser(session?.user || null);
        setLoading(false);
      }
    });

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // 빈 의존성 배열

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