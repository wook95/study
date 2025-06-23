import { useQuery } from "@tanstack/react-query";
import { BarChart3, Calendar, Target, TrendingUp } from "lucide-react";
import { useState } from "react";
import MonthlyStats from "../components/MonthlyStats";
import ProgressChart from "../components/ProgressChart";
import StreakCounter from "../components/StreakCounter";
import WeeklyStats from "../components/WeeklyStats";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { api } from "../lib/supabase";

type TabType = "overview" | "weekly" | "monthly";

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedStudyId, setSelectedStudyId] = useState<string>("");

  // 활성 스터디 목록 조회
  const { data: studies } = useQuery({
    queryKey: ["studies"],
    queryFn: () => api.studies.getActiveStudies(),
  });

  // 선택된 스터디 자동 설정
  const currentStudy =
    studies?.find((study) => study.id === selectedStudyId) || studies?.[0];

  if (currentStudy && selectedStudyId !== currentStudy.id) {
    setSelectedStudyId(currentStudy.id);
  }

  if (!studies || studies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              통계 정보 없음
            </CardTitle>
            <CardDescription>진행 중인 스터디가 없습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              새로운 스터디를 만들고 투두를 추가하면 통계를 확인할 수 있습니다.
            </p>
            <Button onClick={() => window.history.back()}>
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            학습 통계
          </h1>
          <p className="text-muted-foreground">
            나의 스터디 진행률과 통계를 확인해보세요
          </p>
        </div>

        {/* 스터디 선택 */}
        {studies.length > 1 && (
          <select
            value={selectedStudyId}
            onChange={(e) => setSelectedStudyId(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            {studies.map((study) => (
              <option key={study.id} value={study.id}>
                {study.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 현재 스터디 정보 */}
      {currentStudy && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{currentStudy.name}</CardTitle>
            <CardDescription>
              {new Date(currentStudy.start_date).toLocaleDateString()} ~{" "}
              {new Date(currentStudy.end_date).toLocaleDateString()}
              {currentStudy.category && ` • ${currentStudy.category}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  D
                  {Math.ceil(
                    (new Date(currentStudy.end_date).getTime() -
                      new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                </span>
              </div>
              {currentStudy.daily_goal_hours && (
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>일일 목표: {currentStudy.daily_goal_hours}시간</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 탭 네비게이션 */}
      <div className="border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              전체 현황
            </div>
          </button>
          <button
            onClick={() => setActiveTab("weekly")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "weekly"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              주간 통계
            </div>
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "monthly"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              월간 통계
            </div>
          </button>
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="space-y-6">
        {activeTab === "overview" && currentStudy && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* 연속 달성일 */}
            <StreakCounter studyId={currentStudy.id} />

            {/* 전체 진행률 차트 */}
            <ProgressChart studyId={currentStudy.id} />
          </div>
        )}

        {activeTab === "weekly" && currentStudy && (
          <WeeklyStats studyId={currentStudy.id} />
        )}

        {activeTab === "monthly" && currentStudy && (
          <MonthlyStats studyId={currentStudy.id} />
        )}
      </div>
    </div>
  );
}
