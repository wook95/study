import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import CreateStudyModal from "../components/CreateStudyModal";
import PWAInstallButton from "../components/PWAInstallButton";
import StudyCard from "../components/StudyCard";
import TodayTodos from "../components/TodayTodos";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { api } from "../lib/supabase";

export default function HomePage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    data: studies,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["studies"],
    queryFn: () => api.studies.getActiveStudies(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">스터디 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">오류 발생</CardTitle>
            <CardDescription>
              데이터를 불러오는 중 문제가 발생했습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error
                ? error.message
                : "알 수 없는 오류가 발생했습니다."}
            </p>
            <Button onClick={() => window.location.reload()}>새로고침</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 md:space-y-8">
        {/* PWA 설치 버튼 */}
        <PWAInstallButton />

        {/* 헤더 */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              스터디 대시보드
            </h1>
            <p className="text-muted-foreground">
              오늘도 화이팅! 💪 꾸준함이 실력이 됩니다.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="w-full md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />새 스터디
          </Button>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {/* 진행 중인 스터디 */}
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-semibold">
              진행 중인 스터디
            </h2>
            {studies && studies.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {studies.map((study) => (
                  <StudyCard key={study.id} study={study} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
                  <div className="text-4xl md:text-6xl mb-4">📚</div>
                  <h3 className="text-base md:text-lg font-medium mb-2">
                    진행 중인 스터디가 없습니다
                  </h3>
                  <p className="text-muted-foreground text-center mb-4 text-sm md:text-base">
                    새로운 스터디를 시작해서 목표를 달성해보세요!
                  </p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full md:w-auto"
                  >
                    <Plus className="mr-2 h-4 w-4" />첫 스터디 만들기
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 오늘의 할일 */}
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-semibold">오늘의 할일</h2>
            <TodayTodos studies={studies || []} />
          </div>
        </div>
      </div>

      {/* 스터디 생성 모달 */}
      <CreateStudyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}
