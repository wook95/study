// 앱 상수들
export const APP_NAME = "스터디 응원 앱";
export const DEFAULT_NOTIFICATION_TIME = "22:00";

// 스터디 카테고리
export const STUDY_CATEGORIES = [
  "어학",
  "자격증",
  "코딩",
  "독서",
  "기타",
] as const;

export type StudyCategory = (typeof STUDY_CATEGORIES)[number];

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  CURRENT_STUDY: "current_study",
  SETTINGS: "app_settings",
  THEME: "theme_preference",
} as const;
