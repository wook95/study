import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, LogIn, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { authApi } from "../lib/supabase";

interface LoginData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // 리다이렉트할 경로 (이전 페이지 또는 홈)
  const from = (location.state as any)?.from || "/";
  const message = (location.state as any)?.message;

  // 페이지 진입 시 메시지 표시
  useEffect(() => {
    if (message) {
      toast({
        title: "인증 필요",
        description: message,
        variant: "destructive",
      });
    }
  }, [message, toast]);

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => authApi.signIn(data),
    onSuccess: (result: any) => {
      if (result?.user) {
        toast({
          title: "로그인 성공",
          description: "스터디 완주에 오신 것을 환영합니다!",
        });
        // 이전 페이지로 리다이렉트
        navigate(from, { replace: true });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "로그인 실패",
        description: error.message || "이메일과 비밀번호를 확인해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "입력 오류",
        description: "이메일과 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">로그인</CardTitle>
          <CardDescription>스터디 완주 계정으로 로그인하세요</CardDescription>
          {from !== "/" && (
            <p className="text-sm text-muted-foreground mt-2">
              로그인 후 <span className="font-medium">{from}</span> 페이지로
              이동합니다
            </p>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loginMutation.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loginMutation.isPending}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loginMutation.isPending}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                "로그인 중..."
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  로그인
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              계정이 없으신가요?{" "}
              <Link
                to="/signup"
                className="font-medium text-primary hover:underline"
              >
                회원가입
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/reset-password"
              className="text-sm text-muted-foreground hover:text-primary hover:underline"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
