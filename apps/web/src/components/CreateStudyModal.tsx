import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Calendar, Tag, Target, X } from "lucide-react";
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
import { Label } from "./ui/label";

interface CreateStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StudyFormData {
  name: string;
  startDate: string;
  endDate: string;
  dailyGoalHours: number | "";
  category: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  dailyGoalHours?: string;
}

export default function CreateStudyModal({
  isOpen,
  onClose,
}: CreateStudyModalProps) {
  const [formData, setFormData] = useState<StudyFormData>({
    name: "",
    startDate: "",
    endDate: "",
    dailyGoalHours: "",
    category: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 스터디 생성 mutation
  const createStudyMutation = useMutation({
    mutationFn: async (data: StudyFormData) => {
      return api.studies.createStudy({
        name: data.name,
        start_date: data.startDate,
        end_date: data.endDate,
        daily_goal_hours: data.dailyGoalHours || null,
        category: data.category || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies"] });
      toast({
        title: "스터디 생성 완료",
        description: "새로운 스터디가 성공적으로 생성되었습니다.",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "오류 발생",
        description:
          error instanceof Error
            ? error.message
            : "스터디 생성에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.title = "제목을 입력해주세요";
    }

    if (!formData.startDate) {
      newErrors.description = "시작일을 선택해주세요.";
    }

    if (!formData.endDate) {
      newErrors.description = "종료일을 선택해주세요.";
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.description = "종료일은 시작일보다 늦어야 합니다.";
      }
    }

    if (
      typeof formData.dailyGoalHours === "number" &&
      (formData.dailyGoalHours < 1 || formData.dailyGoalHours > 24)
    ) {
      newErrors.dailyGoalHours = "목표 시간은 1-24시간 사이여야 합니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createStudyMutation.mutate(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      startDate: "",
      endDate: "",
      dailyGoalHours: "",
      category: "",
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (
    field: keyof StudyFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 메시지 즉시 제거
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
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
                <BookOpen className="h-5 w-5" />새 스터디 만들기
              </CardTitle>
              <CardDescription>
                목표를 설정하고 꾸준히 학습해보세요
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 스터디 이름 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                스터디 이름 *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="예: 토익 900점 도전, 리액트 마스터하기"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            {/* 기간 설정 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  시작일 *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  종료일 *
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* 목표 시간 */}
            <div className="space-y-2">
              <Label
                htmlFor="dailyGoalHours"
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                일일 목표 시간 (선택사항)
              </Label>
              <Input
                id="dailyGoalHours"
                type="number"
                min="1"
                max="24"
                value={formData.dailyGoalHours}
                onChange={(e) =>
                  handleInputChange(
                    "dailyGoalHours",
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                placeholder="예: 2 (시간)"
                className={errors.dailyGoalHours ? "border-destructive" : ""}
              />
              {errors.dailyGoalHours && (
                <p className="text-sm text-destructive">
                  {errors.dailyGoalHours}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                하루에 목표로 하는 학습 시간을 설정하세요
              </p>
            </div>

            {/* 카테고리 */}
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                카테고리 (선택사항)
              </Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                placeholder="예: 어학, 코딩, 자격증, 취미"
              />
              <p className="text-sm text-muted-foreground">
                스터디를 분류할 수 있는 카테고리를 설정하세요
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={createStudyMutation.isPending}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createStudyMutation.isPending}
              >
                {createStudyMutation.isPending ? "생성 중..." : "스터디 만들기"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
