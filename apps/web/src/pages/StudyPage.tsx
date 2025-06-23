import { useParams } from "react-router-dom";

export default function StudyPage() {
  const { studyId } = useParams<{ studyId: string }>();

  return (
    <div>
      <h1>스터디 페이지 (ID: {studyId})</h1>
      <p>곧 구현 예정...</p>
    </div>
  );
}
