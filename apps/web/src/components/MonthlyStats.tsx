import { useQuery } from "@tanstack/react-query";
import { BarChart3, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  Line,
  LineChart,
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

interface MonthlyStatsProps {
  studyId: string;
}

export default function MonthlyStats({ studyId }: MonthlyStatsProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1, // 1-12
    };
  });

  // 월간 통계 조회
  const { data: monthlyData, isLoading } = useQuery({
    queryKey: ["monthly-stats", studyId, currentMonth.year, currentMonth.month],
    queryFn: async () => {
      const monthStart = new Date(currentMonth.year, currentMonth.month - 1, 1);
      const monthEnd = new Date(currentMonth.year, currentMonth.month, 0);

      const startDateStr = monthStart.toISOString().split("T")[0];
      const endDateStr = monthEnd.toISOString().split("T")[0];

      const todos = await api.todos.getTodosByDateRange(
        startDateStr,
        endDateStr,
        studyId
      );

      // 주별 통계 계산
      const weeklyStats = [];
      let currentWeekStart = new Date(monthStart);

      // 월 첫째 주 시작일을 일요일로 맞춤
      while (currentWeekStart.getDay() !== 0) {
        currentWeekStart.setDate(currentWeekStart.getDate() - 1);
      }

      let weekNumber = 1;
      while (currentWeekStart <= monthEnd) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekStartStr = currentWeekStart.toISOString().split("T")[0];
        const weekEndStr = weekEnd.toISOString().split("T")[0];

        const weekTodos = todos.filter(
          (todo) => todo.date >= weekStartStr && todo.date <= weekEndStr
        );

        const totalTodos = weekTodos.length;
        const completedTodos = weekTodos.filter(
          (todo) => todo.is_completed
        ).length;

        weeklyStats.push({
          weekNumber,
          weekStart: weekStartStr,
          weekEnd: weekEndStr,
          weekLabel: `${weekNumber}주차`,
          totalTodos,
          completedTodos,
          completionRate:
            totalTodos > 0
              ? Math.round((completedTodos / totalTodos) * 100)
              : 0,
        });

        weekNumber++;
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      }

      // 월간 총계
      const monthTotals = {
        totalTodos: todos.length,
        completedTodos: todos.filter((todo) => todo.is_completed).length,
        activeDays: new Set(todos.map((todo) => todo.date)).size,
      };

      return {
        weeklyStats,
        monthTotals,
        monthCompletionRate:
          monthTotals.totalTodos > 0
            ? Math.round(
                (monthTotals.completedTodos / monthTotals.totalTodos) * 100
              )
            : 0,
      };
    },
    enabled: !!studyId,
  });

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 1) {
        return { year: prev.year - 1, month: 12 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 12) {
        return { year: prev.year + 1, month: 1 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth({
      year: today.getFullYear(),
      month: today.getMonth() + 1,
    });
  };

  const formatMonthTitle = () => {
    return `${currentMonth.year}년 ${currentMonth.month}월`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            월간 통계
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              월간 통계
            </CardTitle>
            <CardDescription>{formatMonthTitle()}</CardDescription>
          </div>

          {/* 월간 네비게이션 */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              이번 달
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 월간 요약 */}
          {monthlyData && (
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {monthlyData.monthTotals.totalTodos}
                </div>
                <div className="text-xs text-muted-foreground">총 투두</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {monthlyData.monthTotals.completedTodos}
                </div>
                <div className="text-xs text-muted-foreground">완료</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {monthlyData.monthCompletionRate}%
                </div>
                <div className="text-xs text-muted-foreground">완료율</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {monthlyData.monthTotals.activeDays}
                </div>
                <div className="text-xs text-muted-foreground">활동일</div>
              </div>
            </div>
          )}

          {/* 주별 트렌드 차트 */}
          {monthlyData && monthlyData.weeklyStats.length > 0 && (
            <div className="h-48">
              <h4 className="text-sm font-medium mb-3">주별 완료율 트렌드</h4>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData.weeklyStats}>
                  <XAxis
                    dataKey="weekLabel"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "완료율"]}
                    labelFormatter={(label) => label}
                  />
                  <Line
                    type="monotone"
                    dataKey="completionRate"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 주별 상세 */}
          {monthlyData && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">주별 상세</h4>
              <div className="space-y-3">
                {monthlyData.weeklyStats.map((week) => (
                  <div
                    key={week.weekNumber}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{week.weekLabel}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(week.weekStart).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        ~{" "}
                        {new Date(week.weekEnd).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {week.completedTodos}/{week.totalTodos}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {week.completionRate}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 데이터 없음 */}
          {monthlyData && monthlyData.monthTotals.totalTodos === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                이번 달에는 아직 투두가 없습니다.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
