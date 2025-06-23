import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Circle, Clock, TrendingUp } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "../lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";

interface ProgressChartProps {
  studyId: string;
}

export default function ProgressChart({ studyId }: ProgressChartProps) {
  // 투두 데이터 조회 (지난 30일)
  const { data: todos, isLoading } = useQuery({
    queryKey: ["todos-range", studyId],
    queryFn: async () => {
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const startDateStr = startDate.toISOString().split("T")[0];

      return api.todos.getTodosByDateRange(startDateStr, endDate, studyId);
    },
    enabled: !!studyId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            진행률 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-32 bg-muted rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!todos || todos.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            진행률 분석
          </CardTitle>
          <CardDescription>지난 30일간의 진행률입니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              아직 투두가 없습니다.
              <br />
              투두를 추가하고 완료하면 진행률을 확인할 수 있어요!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 통계 계산
  const totalTodos = todos.length;
  const completedTodos = todos.filter((todo) => todo.is_completed).length;
  const pendingTodos = totalTodos - completedTodos;
  const completionRate =
    totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  // 차트 데이터
  const chartData = [
    {
      name: "완료",
      value: completedTodos,
      color: "#10b981", // green-500
    },
    {
      name: "미완료",
      value: pendingTodos,
      color: "#f59e0b", // amber-500
    },
  ];

  // 색상 배열
  const COLORS = ["#10b981", "#f59e0b"];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          진행률 분석
        </CardTitle>
        <CardDescription>지난 30일간의 진행률입니다</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 전체 진행률 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>전체 완료율</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          {/* 파이 차트 */}
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}개`, "투두"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 상세 통계 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="font-medium">{completedTodos}</div>
                <div className="text-xs text-muted-foreground">완료</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-amber-500" />
              <div>
                <div className="font-medium">{pendingTodos}</div>
                <div className="text-xs text-muted-foreground">미완료</div>
              </div>
            </div>
          </div>

          {/* 격려 메시지 */}
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {completionRate >= 80 && "정말 훌륭해요! 🎉"}
              {completionRate >= 60 &&
                completionRate < 80 &&
                "잘하고 있어요! 💪"}
              {completionRate >= 40 &&
                completionRate < 60 &&
                "조금 더 힘내봐요! 📚"}
              {completionRate < 40 && "천천히 꾸준히 해나가봐요! 🌱"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
