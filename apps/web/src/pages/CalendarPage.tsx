import { useQuery } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import DayDetailModal from "../components/DayDetailModal";
import StudyCalendar from "../components/StudyCalendar";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { api } from "../lib/supabase";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStudyId, setSelectedStudyId] = useState<string>("");
  const [showDayDetail, setShowDayDetail] = useState(false);

  // 현재 활성 스터디 목록 조회
  const { data: studies, isLoading: studiesLoading } = useQuery({
    queryKey: ["studies"],
    queryFn: () => api.studies.getActiveStudies(),
  });

  // 첫 번째 스터디를 기본으로 선택
  const defaultStudyId = studies?.[0]?.id || "";
  const currentStudyId = selectedStudyId || defaultStudyId;
  const currentStudy = studies?.find((s) => s.id === currentStudyId);

  // 선택된 스터디의 투두 데이터 조회 (현재 월)
  const currentMonth = selectedDate.getMonth() + 1;
  const currentYear = selectedDate.getFullYear();
  const startDate = `${currentYear}-${currentMonth
    .toString()
    .padStart(2, "0")}-01`;
  const endDate = new Date(currentYear, currentMonth, 0)
    .toISOString()
    .split("T")[0];

  const { data: todos, isLoading: todosLoading } = useQuery({
    queryKey: ["monthlyTodos", currentStudyId, currentYear, currentMonth],
    queryFn: () =>
      currentStudyId
        ? api.todos.getTodosByDateRange(currentStudyId, startDate, endDate)
        : Promise.resolve([]),
    enabled: !!currentStudyId,
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowDayDetail(true);
  };

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setSelectedDate(newDate);
  };

  if (studiesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">스터디 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!studies || studies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>📅 캘린더</CardTitle>
            <CardDescription>진행 중인 스터디가 없습니다.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-muted-foreground mb-4">
              새로운 스터디를 시작해서
              <br />
              진행 상황을 확인해보세요!
            </p>
            <Button>새 스터디 만들기</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">스터디 캘린더</h1>
          <p className="text-muted-foreground">
            진행 상황을 한눈에 확인하고 목표를 달성하세요 📈
          </p>
        </div>

        {/* 스터디 선택 */}
        {studies.length > 1 && (
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <select
              value={currentStudyId}
              onChange={(e) => setSelectedStudyId(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background min-w-[200px]"
            >
              {studies.map((study) => (
                <option key={study.id} value={study.id}>
                  {study.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 현재 스터디 정보 */}
      {currentStudy && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {currentStudy.name}
            </CardTitle>
            <CardDescription>
              {new Date(currentStudy.start_date).toLocaleDateString()} ~{" "}
              {new Date(currentStudy.end_date).toLocaleDateString()}
              {currentStudy.daily_goal_hours &&
                ` • 일일 목표: ${currentStudy.daily_goal_hours}시간`}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* 캘린더 네비게이션 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMonthChange(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                오늘
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMonthChange(1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {todosLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">데이터를 불러오는 중...</p>
              </div>
            </div>
          ) : (
            <StudyCalendar
              currentDate={selectedDate}
              todos={todos || []}
              onDateSelect={handleDateSelect}
              studyPeriod={{
                start: new Date(currentStudy?.start_date || ""),
                end: new Date(currentStudy?.end_date || ""),
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* 범례 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">범례</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span>완료</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span>일부 완료</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span>미완료</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-800"></div>
              <span>할일 없음</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 날짜 상세 모달 */}
      {showDayDetail && (
        <DayDetailModal
          date={selectedDate}
          studyId={currentStudyId}
          studyName={currentStudy?.name || ""}
          isOpen={showDayDetail}
          onClose={() => setShowDayDetail(false)}
        />
      )}
    </div>
  );
}
