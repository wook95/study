import { BarChart3, BookOpen, Calendar, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { href: "/", label: "홈", icon: Home },
    { href: "/calendar", label: "캘린더", icon: Calendar },
    { href: "/statistics", label: "통계", icon: BarChart3 },
  ];

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">스터디 응원</span>
          </div>

          <div className="flex items-center space-x-6">
            {navItems.map((item) => {
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
          </div>
        </div>
      </div>
    </nav>
  );
}
