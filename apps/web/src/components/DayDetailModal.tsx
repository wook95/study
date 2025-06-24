import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, CheckCircle, Circle, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "../hooks/use-toast";
import { api } from "../lib/supabase";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";

interface DayDetailModalProps {
  date: Date;
  studyId: string;
  studyName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DayDetailModal({
  date,
  studyId,
  studyName,
  isOpen,
  onClose,
}: DayDetailModalProps) {
  const [newTodoText, setNewTodoText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const dateStr = date.toISOString().split("T")[0];
  const formattedDate = date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  // 해당 날짜의 투두 목록 조회
  const { data: todos, isLoading } = useQuery({
    queryKey: ["dayTodos", studyId, dateStr],
    queryFn: () => api.todos.getTodosByDate(studyId, dateStr),
    enabled: isOpen && !!studyId,
  });

  // 투두 추가 mutation
  const addTodoMutation = useMutation({
    mutationFn: async (content: string) => {
      return api.todos.createTodo({
        study_id: studyId,
        date: dateStr,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dayTodos", studyId, dateStr],
      });
      queryClient.invalidateQueries({ queryKey: ["monthlyTodos"] });
      queryClient.invalidateQueries({ queryKey: ["todayTodos"] });
      setNewTodoText("");
      toast({
        title: "투두 추가 완료",
        description: "새로운 할일이 추가되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "오류 발생",
        description:
          error instanceof Error ? error.message : "투두 추가에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // 투두 토글 mutation
  const toggleTodoMutation = useMutation({
    mutationFn: (id: string) => api.todos.toggleTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });

  // 투두 삭제 mutation
  const deleteTodoMutation = useMutation({
    mutationFn: (id: string) => api.todos.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dayTodos", studyId, dateStr],
      });
      queryClient.invalidateQueries({ queryKey: ["monthlyTodos"] });
      queryClient.invalidateQueries({ queryKey: ["todayTodos"] });
      toast({
        title: "투두 삭제 완료",
        description: "할일이 삭제되었습니다.",
      });
    },
  });

  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;
    addTodoMutation.mutate(newTodoText.trim());
  };

  const handleToggleTodo = (id: string) => {
    toggleTodoMutation.mutate(id);
  };

  const handleDeleteTodo = (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      deleteTodoMutation.mutate(id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {formattedDate}
              </CardTitle>
              <CardDescription>{studyName}</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 overflow-y-auto">
          {/* 투두 추가 */}
          <div className="flex gap-2">
            <Input
              placeholder="새로운 할일을 입력하세요..."
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddTodo()}
              disabled={addTodoMutation.isPending}
            />
            <Button
              onClick={handleAddTodo}
              disabled={!newTodoText.trim() || addTodoMutation.isPending}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* 투두 목록 */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              할일을 불러오는 중...
            </div>
          ) : todos && todos.length > 0 ? (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTodo(todo.id)}
                    disabled={toggleTodoMutation.isPending}
                    className="text-primary hover:text-primary/80"
                  >
                    {todo.is_completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>

                  <span
                    className={`flex-1 ${
                      todo.is_completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {todo.content}
                  </span>

                  {todo.completed_at && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(todo.completed_at).toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteTodo(todo.id)}
                    disabled={deleteTodoMutation.isPending}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-muted-foreground">
                이 날짜의 할일이 없습니다.
                <br />
                새로운 목표를 추가해보세요!
              </p>
            </div>
          )}

          {/* 진행 상황 요약 */}
          {todos && todos.length > 0 && (
            <div className="pt-4 border-t bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">진행 상황</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    총 {todos.length}개
                  </span>
                  <span className="text-green-600 font-medium">
                    완료 {todos.filter((t) => t.is_completed).length}개
                  </span>
                  <span className="text-blue-600 font-bold">
                    {Math.round(
                      (todos.filter((t) => t.is_completed).length /
                        todos.length) *
                        100
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
