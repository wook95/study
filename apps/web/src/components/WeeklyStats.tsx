import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../lib/supabase";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface WeeklyStatsProps {
  studyId: string;
}

export default function WeeklyStats({ studyId }: WeeklyStatsProps) {
  const [currentWeek, setCurrentWeek] = useState(() => {
    // 이번 주 시작일 (일요일)
    const today = new Date();
    const day = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - day);
    return startOfWeek.toISOString().split("T")[0];
  });

  // 주간 통계 조회
  const { data: weeklyStats, isLoading } = useQuery({
    queryKey: ["weekly-stats", studyId, currentWeek],
    queryFn: async () => {
      const startDate = new Date(currentWeek);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      const todos = await api.todos.getTodosByDateRange(
        startDateStr,
        endDateStr,
        studyId
      );

      // 일별 통계 계산
      const dailyStats = [];
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);
        const dateStr = currentDate.toISOString().split("T")[0];

        const dayTodos = todos.filter((todo) => todo.date === dateStr);
        const totalTodos = dayTodos.length;
        const completedTodos = dayTodos.filter(
          (todo) => todo.is_completed
        ).length;

        dailyStats.push({
          date: dateStr,
          dayName: currentDate.toLocaleDateString("ko-KR", {
            weekday: "short",
          }),
          totalTodos,
          completedTodos,
          completionRate:
            totalTodos > 0
              ? Math.round((completedTodos / totalTodos) * 100)
              : 0,
        });
      }

      return dailyStats;
    },
    enabled: !!studyId,
  });

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate.toISOString().split("T")[0]);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate.toISOString().split("T")[0]);
  };

  const handleToday = () => {
    const today = new Date();
    const day = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - day);
    setCurrentWeek(startOfWeek.toISOString().split("T")[0]);
  };

  // 현재 주의 시작일과 종료일
  const weekStart = new Date(currentWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const formatWeekRange = () => {
    const start = weekStart.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
    const end = weekEnd.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
    return `${start} ~ ${end}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            주간 통계
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-48 bg-muted rounded mb-4"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 주간 총 통계
  const weekTotals = weeklyStats?.reduce(
    (acc, day) => ({
      totalTodos: acc.totalTodos + day.totalTodos,
      completedTodos: acc.completedTodos + day.completedTodos,
    }),
    { totalTodos: 0, completedTodos: 0 }
  ) || { totalTodos: 0, completedTodos: 0 };

  const weekCompletionRate =
    weekTotals.totalTodos > 0
      ? Math.round((weekTotals.completedTodos / weekTotals.totalTodos) * 100)
      : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              주간 통계
            </CardTitle>
            <CardDescription>{formatWeekRange()}</CardDescription>
          </div>

          {/* 주간 네비게이션 */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              오늘
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 주간 요약 */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{weekTotals.totalTodos}</div>
              <div className="text-xs text-muted-foreground">총 투두</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {weekTotals.completedTodos}
              </div>
              <div className="text-xs text-muted-foreground">완료</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {weekCompletionRate}%
              </div>
              <div className="text-xs text-muted-foreground">완료율</div>
            </div>
          </div>

          {/* 일별 차트 */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats}>
                <XAxis
                  dataKey="dayName"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    value,
                    name === "completedTodos" ? "완료" : "총 투두",
                  ]}
                  labelFormatter={(label) => `${label}요일`}
                />
                <Bar
                  dataKey="totalTodos"
                  fill="#e5e7eb"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="completedTodos"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 일별 상세 */}
          <div className="grid grid-cols-7 gap-2">
            {weeklyStats?.map((day) => (
              <div key={day.date} className="text-center p-2 rounded-lg border">
                <div className="text-xs font-medium mb-1">{day.dayName}</div>
                <div className="text-lg font-bold">
                  {day.completedTodos}/{day.totalTodos}
                </div>
                <div className="text-xs text-muted-foreground">
                  {day.completionRate}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
