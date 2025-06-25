import {
  BarChart3,
  BookOpen,
  Calendar,
  Home,
  LogIn,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      setMobileMenuOpen(false);
    } catch (error) {
      toast({
        title: "로그아웃 실패",
        description: "로그아웃 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  if (isLoading) {
    return (
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link
              to="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">스터디 응원단</span>
            </Link>
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
          {/* 로고 */}
          <Link
            to="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">스터디 응원단</span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <div className="hidden md:flex items-center space-x-6">
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

            {/* 데스크톱 인증 관련 버튼 */}
            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  <div className="hidden lg:flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="max-w-32 truncate">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/profile")}
                    className="flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden lg:inline">설정</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden lg:inline">로그아웃</span>
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

          {/* 모바일 햄버거 버튼 */}
          <div className="md:hidden">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="h-8 w-8 p-0"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="text-xs px-2"
                >
                  로그인
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/signup")}
                  className="text-xs px-2"
                >
                  회원가입
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 모바일 드롭다운 메뉴 */}
        {mobileMenuOpen && user && (
          <div className="md:hidden border-t bg-card">
            <div className="px-4 py-4 space-y-3">
              {/* 사용자 정보 */}
              <div className="flex items-center space-x-3 pb-3 border-b">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.user_metadata?.full_name || "사용자"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* 네비게이션 메뉴 */}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* 설정 및 로그아웃 */}
              <div className="space-y-1 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/profile");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-foreground hover:bg-accent w-full text-left transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  <span>설정</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950 w-full text-left transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>로그아웃</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
