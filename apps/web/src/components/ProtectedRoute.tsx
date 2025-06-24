import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Card, CardContent } from "./ui/card";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">인증 확인 중...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname,
          message: "로그인이 필요한 페이지입니다.",
        }}
        replace
      />
    );
  }

  // 인증된 사용자에게는 자식 컴포넌트 렌더링
  return <>{children}</>;
}
