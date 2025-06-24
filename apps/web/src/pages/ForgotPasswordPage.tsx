import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/supabase";
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await authApi.resetPassword(email);
      setIsSubmitted(true);
      toast({
        title: "이메일을 확인하세요",
        description: "비밀번호 재설정 링크가 전송되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "오류가 발생했습니다",
        description: error.message || "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              이메일을 확인하세요
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-gray-600">
              <p className="mb-4">
                <strong>{email}</strong>로 비밀번호 재설정 링크를 전송했습니다.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                이메일을 받지 못하셨나요? 스팸 폴더도 확인해보세요.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="w-full"
                >
                  다른 이메일로 재전송
                </Button>
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    로그인으로 돌아가기
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            비밀번호를 잊으셨나요?
          </CardTitle>
          <p className="text-gray-600 mt-2">
            이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? "전송 중..." : "재설정 링크 전송"}
            </Button>

            <div className="text-center space-y-2">
              <Link to="/login">
                <Button
                  variant="ghost"
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  로그인으로 돌아가기
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
