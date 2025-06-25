import type { Todo } from "@shared/core";
import { cn } from "../lib/utils";

interface StudyCalendarProps {
  currentDate: Date;
  todos: Todo[];
  onDateSelect: (date: Date) => void;
  studyPeriod: {
    start: Date;
    end: Date;
  };
}

export default function StudyCalendar({
  currentDate,
  todos,
  onDateSelect,
  studyPeriod,
}: StudyCalendarProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 현재 월의 첫 번째 날과 마지막 날
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 캘린더에 표시할 시작일 (이전 월의 마지막 주 포함)
  const startDay = new Date(firstDay);
  startDay.setDate(startDay.getDate() - firstDay.getDay());

  // 캘린더에 표시할 종료일 (다음 월의 첫 주 포함)
  const endDay = new Date(lastDay);
  endDay.setDate(endDay.getDate() + (6 - lastDay.getDay()));

  // 달력에 표시할 날짜들 생성
  const calendarDays: Date[] = [];
  const currentDay = new Date(startDay);

  while (currentDay <= endDay) {
    calendarDays.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  // 특정 날짜의 투두 진행 상태 계산
  const getDateStatus = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const dayTodos = todos.filter((todo) => todo.date === dateStr);

    if (dayTodos.length === 0) {
      return "none"; // 할일 없음
    }

    const completedCount = dayTodos.filter((todo) => todo.is_completed).length;
    const totalCount = dayTodos.length;

    if (completedCount === totalCount) {
      return "completed"; // 완료
    }
    if (completedCount > 0) {
      return "partial"; // 일부 완료
    }
    return "incomplete"; // 미완료
  };

  // 날짜가 스터디 기간 내에 있는지 확인
  const isInStudyPeriod = (date: Date) => {
    return date >= studyPeriod.start && date <= studyPeriod.end;
  };

  // 날짜가 현재 월에 속하는지 확인
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  // 오늘 날짜인지 확인
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // 상태에 따른 스타일 클래스
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "partial":
        return "bg-yellow-500";
      case "incomplete":
        return "bg-red-500";
      default:
        return "bg-gray-200 dark:bg-gray-700";
    }
  };

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="w-full">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={cn(
              "p-1 md:p-2 text-center text-xs md:text-sm font-medium",
              index === 0 ? "text-red-500" : "text-muted-foreground"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const status = getDateStatus(date);
          const inStudyPeriod = isInStudyPeriod(date);
          const currentMonth = isCurrentMonth(date);
          const today = isToday(date);

          return (
            <button
              key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
              type="button"
              onClick={() => onDateSelect(date)}
              disabled={!inStudyPeriod || !currentMonth}
              className={cn(
                "relative aspect-square p-1 text-xs md:text-sm border rounded-lg transition-colors min-h-[44px] md:min-h-[48px]",
                "hover:bg-accent hover:border-accent-foreground active:scale-95 touch-manipulation",
                currentMonth
                  ? "bg-background border-border"
                  : "bg-muted/50 border-muted text-muted-foreground",
                today && "ring-2 ring-primary ring-offset-1 md:ring-offset-2",
                inStudyPeriod && currentMonth
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-50"
              )}
            >
              {/* 날짜 숫자 */}
              <div className="flex items-center justify-center h-full">
                <span
                  className={cn(
                    "font-medium",
                    today && "text-primary font-bold"
                  )}
                >
                  {date.getDate()}
                </span>
              </div>

              {/* 상태 표시 점 */}
              {inStudyPeriod && currentMonth && status !== "none" && (
                <div
                  className={cn(
                    "absolute bottom-1 right-1 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full",
                    getStatusColor(status)
                  )}
                />
              )}

              {/* 투두 개수 표시 (작은 숫자) */}
              {inStudyPeriod &&
                currentMonth &&
                (() => {
                  const dateStr = date.toISOString().split("T")[0];
                  const dayTodos = todos.filter(
                    (todo) => todo.date === dateStr
                  );
                  const todoCount = dayTodos.length;

                  if (todoCount > 0) {
                    return (
                      <div className="absolute top-0.5 right-0.5 md:top-1 md:right-1 text-[10px] md:text-xs text-muted-foreground bg-background/80 rounded-full min-w-[14px] md:min-w-[16px] h-[14px] md:h-[16px] flex items-center justify-center">
                        {todoCount}
                      </div>
                    );
                  }
                  return null;
                })()}
            </button>
          );
        })}
      </div>

      {/* 캘린더 하단 요약 정보 */}
      <div className="mt-4 p-3 md:p-4 bg-muted/50 rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-xs md:text-sm">
          {(() => {
            const monthTodos = todos.filter((todo) => {
              const todoDate = new Date(todo.date);
              return (
                todoDate.getMonth() === month && todoDate.getFullYear() === year
              );
            });

            const totalTodos = monthTodos.length;
            const completedTodos = monthTodos.filter(
              (todo) => todo.is_completed
            ).length;
            const uniqueDays = new Set(monthTodos.map((todo) => todo.date))
              .size;

            return (
              <>
                <div className="text-center">
                  <div className="font-semibold text-base md:text-lg">
                    {totalTodos}
                  </div>
                  <div className="text-muted-foreground">총 할일</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-base md:text-lg text-green-600">
                    {completedTodos}
                  </div>
                  <div className="text-muted-foreground">완료</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-base md:text-lg">
                    {uniqueDays}
                  </div>
                  <div className="text-muted-foreground">활동 일수</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-base md:text-lg text-blue-600">
                    {totalTodos > 0
                      ? Math.round((completedTodos / totalTodos) * 100)
                      : 0}
                    %
                  </div>
                  <div className="text-muted-foreground">완료율</div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
