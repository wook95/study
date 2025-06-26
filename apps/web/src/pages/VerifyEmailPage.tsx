import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/supabase";
import { CheckCircle, Loader, XCircle, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        // 토큰이 있는지 확인
        if (!accessToken && !tokenHash) {
          setStatus("error");
          setErrorMessage("유효하지 않은 인증 링크입니다.");
          return;
        }

        // 인증 타입이 올바른지 확인
        if (type !== "signup" && type !== "email") {
          setStatus("error");
          setErrorMessage("올바르지 않은 인증 타입입니다.");
          return;
        }

        // 토큰을 사용해 세션 설정
        if (accessToken && refreshToken) {
          const { data, error } = await authApi.supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            if (error.message.includes("expired") || error.message.includes("invalid")) {
              setStatus("expired");
              setErrorMessage("인증 링크가 만료되었습니다.");
            } else {
              setStatus("error");
              setErrorMessage(error.message);
            }
            return;
          }

          if (data.user?.email_confirmed_at) {
            setStatus("success");
            localStorage.removeItem("pending_verification_email");
            toast({
              title: "이메일 확인 완료",
              description: "이메일이 성공적으로 확인되었습니다!",
            });
          } else {
            setStatus("error");
            setErrorMessage("이메일 확인에 실패했습니다.");
          }
        } else {
          setStatus("error");
          setErrorMessage("필요한 토큰이 없습니다.");
        }
      } catch (error: any) {
        console.error("Email verification error:", error);
        if (error.message.includes("expired") || error.message.includes("invalid")) {
          setStatus("expired");
          setErrorMessage("인증 링크가 만료되었거나 이미 사용되었습니다.");
        } else {
          setStatus("error");
          setErrorMessage(error.message || "이메일 확인 중 오류가 발생했습니다.");
        }
      }
    };

    verifyEmail();
  }, [searchParams, toast]);

  const handleResendEmail = async () => {
    if (isResending) return;

    try {
      setIsResending(true);
      const email = localStorage.getItem("pending_verification_email");
      
      if (!email) {
        toast({
          title: "이메일 정보를 찾을 수 없음",
          description: "회원가입 페이지에서 다시 진행해주세요.",
          variant: "destructive",
        });
        navigate("/signup");
        return;
      }

      await authApi.resendConfirmation(email);
      toast({
        title: "이메일을 다시 전송했습니다",
        description: "새로운 확인 이메일을 확인해주세요.",
      });
      
      // 이메일 인증 대기 페이지로 리다이렉트
      navigate(`/email-verification-pending?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.error("Resend email error:", error);
      toast({
        title: "재전송 실패",
        description: error.message || "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const getIcon = () => {
    switch (status) {
      case "loading":
        return <Loader className="h-12 w-12 mx-auto mb-4 animate-spin text-indigo-600" />;
      case "success":
        return <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />;
      case "expired":
        return <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-600" />;
      case "error":
      default:
        return <XCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case "loading":
        return "이메일 확인 중...";
      case "success":
        return "이메일 확인 완료!";
      case "expired":
        return "링크 만료";
      case "error":
      default:
        return "확인 실패";
    }
  };

  const getDescription = () => {
    switch (status) {
      case "loading":
        return "이메일 확인을 처리하고 있습니다...";
      case "success":
        return "이메일이 성공적으로 확인되었습니다. 이제 로그인할 수 있습니다.";
      case "expired":
        return "인증 링크가 만료되었습니다. 새로운 확인 이메일을 요청해주세요.";
      case "error":
      default:
        return errorMessage || "이메일 확인에 실패했습니다.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {getIcon()}
          <CardTitle className="text-2xl font-bold text-gray-800">
            {getTitle()}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 mb-6">
            {getDescription()}
          </p>

          {status === "success" && (
            <Button
              onClick={() => navigate("/login")}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              로그인하기
            </Button>
          )}

          {(status === "error" || status === "expired") && (
            <div className="space-y-2">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {isResending ? "전송 중..." : "확인 이메일 재전송"}
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                variant="outline"
                className="w-full"
              >
                회원가입으로 돌아가기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
