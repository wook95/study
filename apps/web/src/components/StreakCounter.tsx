import { useQuery } from "@tanstack/react-query";
import { Calendar, Flame, Trophy } from "lucide-react";
import { api } from "../lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface StreakCounterProps {
  studyId: string;
}

export default function StreakCounter({ studyId }: StreakCounterProps) {
  // 연속 달성일 조회
  const { data: streakCount, isLoading } = useQuery({
    queryKey: ["streak", studyId],
    queryFn: () => api.todos.getStreakCount(studyId),
    enabled: !!studyId,
  });

  // 전체 진행률 조회
  const { data: progress } = useQuery({
    queryKey: ["progress", studyId],
    queryFn: () => api.todos.getStudyProgress(studyId),
    enabled: !!studyId,
  });

  const getStreakMessage = (count: number) => {
    if (count === 0) return "첫 번째 달성을 해보세요!";
    if (count === 1) return "좋은 시작이에요!";
    if (count < 7) return "잘하고 있어요!";
    if (count < 30) return "대단해요! 계속 이어가세요!";
    return "놀라워요! 습관의 달인이군요!";
  };

  const getStreakColor = (count: number) => {
    if (count === 0) return "text-muted-foreground";
    if (count < 7) return "text-orange-500";
    if (count < 30) return "text-blue-500";
    return "text-purple-500";
  };

  const getStreakIcon = (count: number) => {
    if (count === 0) return Calendar;
    if (count < 7) return Flame;
    return Trophy;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            연속 달성일
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-12 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const StreakIcon = getStreakIcon(streakCount || 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <StreakIcon
            className={`h-5 w-5 ${getStreakColor(streakCount || 0)}`}
          />
          연속 달성일
        </CardTitle>
        <CardDescription>투두를 완료한 연속 일수입니다</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 연속 달성일 표시 */}
          <div className="text-center">
            <div
              className={`text-6xl font-bold ${getStreakColor(
                streakCount || 0
              )}`}
            >
              {streakCount || 0}
            </div>
            <div className="text-lg font-medium text-muted-foreground">
              일 연속
            </div>
          </div>

          {/* 메시지 */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {getStreakMessage(streakCount || 0)}
            </p>
          </div>

          {/* 전체 통계 */}
          {progress && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {progress.completedTodos}
                </div>
                <div className="text-xs text-muted-foreground">완료한 투두</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{progress.activeDays}</div>
                <div className="text-xs text-muted-foreground">활동한 날</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
