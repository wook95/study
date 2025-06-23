import type { Study } from "@shared/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "../hooks/use-toast";
import { api } from "../lib/supabase";
import EditStudyModal from "./EditStudyModal";
import { Button } from "./ui/button";

interface StudyActionsMenuProps {
  study: Study;
}

export default function StudyActionsMenu({ study }: StudyActionsMenuProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 스터디 삭제 mutation
  const deleteStudyMutation = useMutation({
    mutationFn: (studyId: string) => api.studies.deleteStudy(studyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies"] });
      toast({
        title: "스터디 삭제 완료",
        description: "스터디가 성공적으로 삭제되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "오류 발생",
        description:
          error instanceof Error
            ? error.message
            : "스터디 삭제에 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    const confirmed = confirm(
      `정말로 "${study.name}" 스터디를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 투두와 기록이 함께 삭제됩니다.`
    );

    if (confirmed) {
      deleteStudyMutation.mutate(study.id);
    }
    setShowDropdown(false);
  };

  const handleEdit = () => {
    setShowEditModal(true);
    setShowDropdown(false);
  };

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDropdown(!showDropdown)}
          className="h-8 w-8 p-0"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>

        {showDropdown && (
          <>
            {/* 배경 클릭으로 드롭다운 닫기 */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />

            {/* 드롭다운 메뉴 */}
            <div className="absolute right-0 top-8 z-20 w-48 bg-popover border rounded-md shadow-lg">
              <div className="p-1">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent rounded-sm transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  수정하기
                </button>

                <div className="h-px bg-border my-1" />

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteStudyMutation.isPending}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-destructive/10 text-destructive rounded-sm transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteStudyMutation.isPending ? "삭제 중..." : "삭제하기"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 수정 모달 */}
      <EditStudyModal
        study={study}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </>
  );
}
