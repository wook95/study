import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/supabase";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authApi.updateProfile({ full_name: fullName });
      toast({
        title: "프로필이 업데이트되었습니다",
        description: "변경사항이 저장되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "업데이트 실패",
        description: error.message || "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "비밀번호가 일치하지 않습니다",
        description: "새 비밀번호를 다시 확인해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "비밀번호가 너무 짧습니다",
        description: "비밀번호는 8자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.updatePassword(newPassword);
      toast({
        title: "비밀번호가 변경되었습니다",
        description: "새 비밀번호로 다시 로그인해주세요.",
      });

      // 비밀번호 변경 후 로그아웃
      await signOut();
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "비밀번호 변경 실패",
        description: error.message || "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm("정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")
    ) {
      return;
    }

    toast({
      title: "계정 삭제",
      description: "계정 삭제 기능은 아직 구현되지 않았습니다.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              프로필 설정
            </h1>
            <p className="text-gray-600">계정 정보를 관리하세요</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex space-x-4">
                <Button
                  variant={activeTab === "profile" ? "default" : "outline"}
                  onClick={() => setActiveTab("profile")}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  기본 정보
                </Button>
                <Button
                  variant={activeTab === "password" ? "default" : "outline"}
                  onClick={() => setActiveTab("password")}
                  className="flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  비밀번호 변경
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === "profile" && (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="pl-10 bg-gray-50"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      이메일은 변경할 수 없습니다.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">이름</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="이름을 입력하세요"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "저장 중..." : "프로필 저장"}
                  </Button>
                </form>
              )}

              {activeTab === "password" && (
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">새 비밀번호</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="8자 이상 입력해주세요"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="새 비밀번호를 다시 입력해주세요"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                    disabled={isLoading || !newPassword || !confirmPassword}
                  >
                    {isLoading ? "변경 중..." : "비밀번호 변경"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">위험 영역</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">계정 삭제</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이
                    작업은 되돌릴 수 없습니다.
                  </p>
                  <Button
                    onClick={handleDeleteAccount}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    계정 삭제
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
