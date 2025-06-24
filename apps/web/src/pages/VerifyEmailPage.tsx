import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/supabase";
import { CheckCircle, Loader, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");

        if (accessToken && refreshToken) {
          // Supabase에서 자동으로 이메일 확인 처리
          setStatus("success");
          toast({
            title: "이메일 확인 완료",
            description: "이메일이 성공적으로 확인되었습니다!",
          });
        } else {
          setStatus("error");
        }
      } catch (error) {
        setStatus("error");
        toast({
          title: "이메일 확인 실패",
          description: "이메일 확인에 실패했습니다.",
          variant: "destructive",
        });
      }
    };

    verifyEmail();
  }, [searchParams, toast]);

  const handleResendEmail = async () => {
    try {
      const email = localStorage.getItem("pending_verification_email");
      if (email) {
        await authApi.resendConfirmation(email);
        toast({
          title: "이메일을 다시 전송했습니다",
          description: "새로운 확인 이메일을 확인해주세요.",
        });
      } else {
        navigate("/signup");
      }
    } catch (error: any) {
      toast({
        title: "재전송 실패",
        description: error.message || "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-cyan-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === "loading" && (
            <>
              <Loader className="h-12 w-12 mx-auto mb-4 animate-spin text-indigo-600" />
              <CardTitle className="text-2xl font-bold text-gray-800">
                이메일 확인 중...
              </CardTitle>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <CardTitle className="text-2xl font-bold text-gray-800">
                이메일 확인 완료!
              </CardTitle>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
              <CardTitle className="text-2xl font-bold text-gray-800">
                확인 실패
              </CardTitle>
            </>
          )}
        </CardHeader>

        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <p className="text-gray-600">이메일 확인을 처리하고 있습니다...</p>
          )}

          {status === "success" && (
            <>
              <p className="text-gray-600 mb-6">
                이메일이 성공적으로 확인되었습니다. 이제 로그인할 수 있습니다.
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                로그인하기
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <p className="text-gray-600 mb-6">
                이메일 확인 링크가 유효하지 않거나 만료되었습니다.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={handleResendEmail}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  확인 이메일 재전송
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  variant="outline"
                  className="w-full"
                >
                  회원가입으로 돌아가기
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
