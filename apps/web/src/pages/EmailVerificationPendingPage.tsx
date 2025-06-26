import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/supabase";
import { CheckCircle, Clock, Mail, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

export default function EmailVerificationPendingPage() {
  const [email, setEmail] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // URL 파라미터에서 이메일 가져오기 또는 localStorage에서 가져오기
    const emailFromUrl = searchParams.get("email");
    const emailFromStorage = localStorage.getItem("pending_verification_email");
    
    const targetEmail = emailFromUrl || emailFromStorage;
    
    if (!targetEmail) {
      // 이메일 정보가 없으면 회원가입 페이지로 리다이렉트
      navigate("/signup");
      return;
    }
    
    setEmail(targetEmail);
  }, [searchParams, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (!email || isResending || resendCooldown > 0) return;

    try {
      setIsResending(true);
      await authApi.resendConfirmation(email);
      setResendCooldown(60); // 60초 쿨다운
      
      toast({
        title: "이메일을 다시 전송했습니다",
        description: "새로운 확인 이메일을 확인해주세요.",
      });
    } catch (error: any) {
      toast({
        title: "재전송 실패",
        description: error.message || "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignup = () => {
    localStorage.removeItem("pending_verification_email");
    navigate("/signup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            이메일 확인 필요
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-gray-600">
              회원가입이 거의 완료되었습니다!
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-blue-600">{email}</span>로<br />
              발송된 확인 이메일을 확인해주세요.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 text-left">
                <p className="font-medium mb-1">확인 단계:</p>
                <ul className="space-y-1 text-xs">
                  <li>1. 이메일 받은편지함을 확인하세요</li>
                  <li>2. 스팸함도 함께 확인해주세요</li>
                  <li>3. 확인 링크를 클릭하세요</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
              className="w-full"
              variant="outline"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  전송 중...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  {resendCooldown}초 후 재전송 가능
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  확인 이메일 재전송
                </>
              )}
            </Button>

            <div className="text-sm text-gray-500 space-y-2">
              <p>이메일을 받지 못하셨나요?</p>
              <div className="space-y-1">
                <Button
                  onClick={handleBackToSignup}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                >
                  다른 이메일로 회원가입
                </Button>
                <div className="text-xs">
                  이미 계정이 있다면{" "}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    로그인
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 