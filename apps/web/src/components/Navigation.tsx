import {
  BarChart3,
  BookOpen,
  Calendar,
  Home,
  LogIn,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading, signOut } = useAuth();

  const navItems = [
    { href: "/", label: "홈", icon: Home },
    { href: "/calendar", label: "캘린더", icon: Calendar },
    { href: "/statistics", label: "통계", icon: BarChart3 },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "로그아웃 실패",
        description: "로그아웃 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">스터디 완주</span>
            </div>
            <div className="text-sm text-muted-foreground">로딩 중...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">스터디 완주</span>
          </div>

          <div className="flex items-center space-x-6">
            {user &&
              navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

            {/* 인증 관련 버튼 */}
            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{user.user_metadata?.full_name || user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/profile")}
                    className="flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>설정</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>로그아웃</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/login")}
                    className="flex items-center space-x-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>로그인</span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate("/signup")}
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>회원가입</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
