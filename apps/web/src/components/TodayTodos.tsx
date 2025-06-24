import type { Study } from "@shared/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Circle, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "../hooks/use-toast";
import { api } from "../lib/supabase";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

interface TodayTodosProps {
  studies: Study[];
}

export default function TodayTodos({ studies }: TodayTodosProps) {
  const [newTodoText, setNewTodoText] = useState("");
  const [selectedStudyId, setSelectedStudyId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 첫 번째 스터디를 기본으로 선택
  const defaultStudyId = studies[0]?.id || "";
  const currentStudyId = selectedStudyId || defaultStudyId;

  // 오늘의 투두 목록 조회
  const { data: todos = [], isLoading } = useQuery({
    queryKey: ["todayTodos", currentStudyId],
    queryFn: () =>
      currentStudyId
        ? api.todos.getTodosByDate(
            new Date().toISOString().split("T")[0],
            currentStudyId
          )
        : Promise.resolve([]),
    enabled: !!currentStudyId,
  });

  // 투두 추가 mutation
  const addTodoMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentStudyId) throw new Error("스터디를 선택해주세요");

      const today = new Date().toISOString().split("T")[0];
      return api.todos.createTodo({
        study_id: currentStudyId,
        date: today,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todayTodos", currentStudyId],
      });
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
      queryClient.invalidateQueries({ queryKey: ["todayTodos"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });

  // 투두 삭제 mutation
  const deleteTodoMutation = useMutation({
    mutationFn: (id: string) => api.todos.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todayTodos", currentStudyId],
      });
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

  const handleToggleTodo = (id: string, currentStatus: boolean) => {
    toggleTodoMutation.mutate(id);
  };

  const handleDeleteTodo = (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      deleteTodoMutation.mutate(id);
    }
  };

  if (studies.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-muted-foreground text-center">
            진행 중인 스터디가 없어서
            <br />
            할일을 추가할 수 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>오늘의 할일</CardTitle>
        {studies.length > 1 && (
          <select
            value={currentStudyId}
            onChange={(e) => setSelectedStudyId(e.target.value)}
            className="w-full p-2 border rounded-md bg-background"
          >
            {studies.map((study) => (
              <option key={study.id} value={study.id}>
                {study.name}
              </option>
            ))}
          </select>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
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
            {todos.map((todo: any) => (
              <div
                key={todo.id}
                className="group flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => handleToggleTodo(todo.id, todo.is_completed)}
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
            <div className="text-4xl mb-4">🎯</div>
            <p className="text-muted-foreground">
              오늘의 할일이 없습니다.
              <br />
              새로운 목표를 추가해보세요!
            </p>
          </div>
        )}

        {/* 진행 상황 요약 */}
        {todos && todos.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">진행 상황</span>
              <span className="font-medium">
                완료: {todos.filter((t: any) => t.is_completed).length} /{" "}
                {todos.length}{" "}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
