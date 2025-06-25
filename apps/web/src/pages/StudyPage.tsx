import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { api, supabase } from "@/lib/supabase";
import type { Study, Todo } from "@shared/types";
import { format, isFuture, isPast, isToday } from "date-fns";
import { ko } from "date-fns/locale";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Plus,
  Target,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function StudyPage() {
  const { studyId } = useParams<{ studyId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [study, setStudy] = useState<Study | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editTodoTitle, setEditTodoTitle] = useState("");

  useEffect(() => {
    if (!studyId || !user) return;

    const fetchStudyData = async () => {
      try {
        setIsLoading(true);

        // 스터디 정보 가져오기
        const studyData = await api.studies.getStudy(studyId);

        // 스터디 기간의 모든 할 일 가져오기
        const todosData = await api.todos.getTodosByDateRange(
          studyData.start_date,
          studyData.end_date,
          studyId
        );

        setStudy(studyData);
        setTodos(todosData);
      } catch (error: any) {
        console.error("스터디 데이터 로딩 실패:", error);
        toast({
          title: "데이터 로딩 실패",
          description: "스터디 정보를 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudyData();
  }, [studyId, user, toast]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim() || !studyId || !user) return;

    try {
      const newTodo = await api.todos.createTodo({
        content: newTodoTitle.trim(),
        study_id: studyId,
        date: format(new Date(), "yyyy-MM-dd"),
      });

      setTodos((prev) => [...prev, newTodo]);
      setNewTodoTitle("");
      setIsAddingTodo(false);

      toast({
        title: "할 일이 추가되었습니다",
        description: `"${newTodoTitle.trim()}"이 추가되었습니다.`,
      });
    } catch (error: any) {
      console.error("할 일 추가 실패:", error);
      toast({
        title: "할 일 추가 실패",
        description: error.message || "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleToggleTodo = async (todoId: string, isCompleted: boolean) => {
    try {
      const updatedTodo = await api.todos.toggleTodo(todoId);
      setTodos((prev) =>
        prev.map((todo) => (todo.id === todoId ? updatedTodo : todo))
      );

      toast({
        title: isCompleted
          ? "할 일을 완료했습니다"
          : "할 일 완료를 취소했습니다",
        description: isCompleted ? "잘하고 있어요! 🎉" : "다시 도전해보세요!",
      });
    } catch (error: any) {
      console.error("할 일 업데이트 실패:", error);
      toast({
        title: "업데이트 실패",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleEditTodo = async (todoId: string) => {
    if (!editTodoTitle.trim()) return;

    try {
      // TodosAPI에 updateTodo가 없으므로 supabase 직접 사용
      const { data: updatedTodo, error } = await supabase
        .from("todos")
        .update({ content: editTodoTitle.trim() })
        .eq("id", todoId)
        .select()
        .single();

      if (error) throw error;

      setTodos((prev) =>
        prev.map((todo) => (todo.id === todoId ? updatedTodo : todo))
      );
      setEditingTodo(null);
      setEditTodoTitle("");

      toast({
        title: "할 일이 수정되었습니다",
        description: `"${editTodoTitle.trim()}"으로 변경되었습니다.`,
      });
    } catch (error: any) {
      console.error("할 일 수정 실패:", error);
      toast({
        title: "수정 실패",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (!confirm("정말로 이 할 일을 삭제하시겠습니까?")) return;

    try {
      await api.todos.deleteTodo(todoId);
      setTodos((prev) => prev.filter((todo) => todo.id !== todoId));

      toast({
        title: "할 일이 삭제되었습니다",
        description: "할 일이 성공적으로 삭제되었습니다.",
      });
    } catch (error: any) {
      console.error("할 일 삭제 실패:", error);
      toast({
        title: "삭제 실패",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const getStudyStatus = () => {
    if (!study) return { label: "알 수 없음", variant: "secondary" as const };

    const today = new Date();
    const startDate = new Date(study.start_date);
    const endDate = new Date(study.end_date);

    if (isFuture(startDate)) {
      return { label: "예정", variant: "outline" as const };
    }
    if (isPast(endDate)) {
      return { label: "완료", variant: "secondary" as const };
    }
    return { label: "진행중", variant: "default" as const };
  };

  const calculateProgress = () => {
    if (!study) return 0;

    const today = new Date();
    const startDate = new Date(study.start_date);
    const endDate = new Date(study.end_date);

    if (isFuture(startDate)) return 0;
    if (isPast(endDate)) return 100;

    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const passedDays = Math.ceil(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return Math.min(Math.max((passedDays / totalDays) * 100, 0), 100);
  };

  const todayTodos = todos.filter((todo) => isToday(new Date(todo.date)));
  const completedTodayTodos = todayTodos.filter((todo) => todo.is_completed);
  const completionRate =
    todayTodos.length > 0
      ? (completedTodayTodos.length / todayTodos.length) * 100
      : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
                <p className="text-gray-600">스터디 정보를 불러오는 중...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                스터디를 찾을 수 없습니다
              </h1>
              <p className="text-gray-600 mb-8">
                요청하신 스터디가 존재하지 않거나 접근 권한이 없습니다.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
              >
                <ArrowLeft className="h-4 w-4" />
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const status = getStudyStatus();
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              홈으로 돌아가기
            </Link>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {study.name}
                </h1>
                <p className="text-gray-600 mb-4">{study.category}</p>
                <div className="flex items-center gap-4">
                  <Badge variant={status.variant}>{status.label}</Badge>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(study.start_date), "yyyy년 M월 d일", {
                        locale: ko,
                      })}{" "}
                      ~{" "}
                      {format(new Date(study.end_date), "yyyy년 M월 d일", {
                        locale: ko,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 진행률 카드 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                스터디 진행률
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>전체 진행률</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>오늘 할 일 완성률</span>
                    <span>{Math.round(completionRate)}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {completedTodayTodos.length}
                    </div>
                    <div className="text-sm text-gray-600">완료한 일</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {todayTodos.length - completedTodayTodos.length}
                    </div>
                    <div className="text-sm text-gray-600">남은 일</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {todos.filter((todo) => todo.is_completed).length}
                    </div>
                    <div className="text-sm text-gray-600">총 완료</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 오늘의 할 일 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  오늘의 할 일
                </CardTitle>
                <Button
                  onClick={() => setIsAddingTodo(true)}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  추가
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* 새 할 일 추가 폼 */}
                {isAddingTodo && (
                  <form
                    onSubmit={handleAddTodo}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="newTodo">새 할 일</Label>
                        <Input
                          id="newTodo"
                          type="text"
                          placeholder="할 일을 입력하세요"
                          value={newTodoTitle}
                          onChange={(e) => setNewTodoTitle(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!newTodoTitle.trim()}
                        >
                          추가
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsAddingTodo(false);
                            setNewTodoTitle("");
                          }}
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  </form>
                )}

                {/* 할 일 목록 */}
                {todayTodos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>오늘 할 일이 없습니다.</p>
                    <p className="text-sm">새로운 할 일을 추가해보세요!</p>
                  </div>
                ) : (
                  todayTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        todo.is_completed
                          ? "bg-green-50 border-green-200"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleTodo(todo.id, !todo.is_completed)
                        }
                        className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center ${
                          todo.is_completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 hover:border-green-500"
                        }`}
                      >
                        {todo.is_completed && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                      </button>

                      <div className="flex-1">
                        {editingTodo === todo.id ? (
                          <div className="flex gap-2">
                            <Input
                              value={editTodoTitle}
                              onChange={(e) => setEditTodoTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleEditTodo(todo.id);
                                } else if (e.key === "Escape") {
                                  setEditingTodo(null);
                                  setEditTodoTitle("");
                                }
                              }}
                              className="text-sm"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleEditTodo(todo.id)}
                              disabled={!editTodoTitle.trim()}
                            >
                              저장
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingTodo(null);
                                setEditTodoTitle("");
                              }}
                            >
                              취소
                            </Button>
                          </div>
                        ) : (
                          <span
                            className={`${
                              todo.is_completed
                                ? "line-through text-gray-500"
                                : "text-gray-900"
                            }`}
                          >
                            {todo.content}
                          </span>
                        )}
                      </div>

                      {editingTodo !== todo.id && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingTodo(todo.id);
                              setEditTodoTitle(todo.content);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTodo(todo.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* 스터디 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                스터디 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">기본 정보</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">스터디명:</span>
                      <span className="font-medium">{study.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">시작일:</span>
                      <span className="font-medium">
                        {format(new Date(study.start_date), "yyyy년 M월 d일", {
                          locale: ko,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">종료일:</span>
                      <span className="font-medium">
                        {format(new Date(study.end_date), "yyyy년 M월 d일", {
                          locale: ko,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">상태:</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">통계</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">총 할 일:</span>
                      <span className="font-medium">{todos.length}개</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">완료한 일:</span>
                      <span className="font-medium text-green-600">
                        {todos.filter((todo) => todo.is_completed).length}개
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">남은 일:</span>
                      <span className="font-medium text-orange-600">
                        {todos.filter((todo) => !todo.is_completed).length}개
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">완료율:</span>
                      <span className="font-medium">
                        {todos.length > 0
                          ? Math.round(
                              (todos.filter((todo) => todo.is_completed)
                                .length /
                                todos.length) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {study.category && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium text-gray-900 mb-2">카테고리</h3>
                  <p className="text-sm text-gray-600">{study.category}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
