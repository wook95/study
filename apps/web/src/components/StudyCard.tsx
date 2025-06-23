import type { Study } from "@shared/core";
import { Calendar, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

interface StudyCardProps {
  study: Study;
}

export default function StudyCard({ study }: StudyCardProps) {
  // 스터디 진행률 계산 (임시로 랜덤값 사용, 나중에 실제 데이터로 교체)
  const progress = Math.floor(Math.random() * 100);

  // D-Day 계산
  const today = new Date();
  const endDate = new Date(study.end_date);
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const getDDayText = () => {
    if (diffDays < 0) return "완료";
    if (diffDays === 0) return "D-Day";
    return `D-${diffDays}`;
  };

  const getDDayColor = () => {
    if (diffDays < 0) return "bg-gray-500";
    if (diffDays <= 7) return "bg-red-500";
    if (diffDays <= 30) return "bg-orange-500";
    return "bg-green-500";
  };

  return (
    <Link to={`/study/${study.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{study.name}</CardTitle>
            <Badge className={`${getDDayColor()} text-white`}>
              {getDDayText()}
            </Badge>
          </div>
          {study.category && (
            <Badge variant="secondary" className="w-fit">
              {study.category}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 진행률 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                진행률
              </span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* 기간 정보 */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(study.start_date).toLocaleDateString()} ~{" "}
              {new Date(study.end_date).toLocaleDateString()}
            </span>
          </div>

          {/* 목표 시간 */}
          {study.daily_goal_hours && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>일일 목표: {study.daily_goal_hours}시간</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
