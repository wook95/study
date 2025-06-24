import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { authApi, supabase } from "../lib/supabase";

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 초기 세션 확인
    const checkAuth = async () => {
      try {
        const result = await authApi.getSession();
        setUser(result?.session?.user || null);
      } catch (error) {
        console.error("Auth check error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await authApi.signOut();
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
  };
} 