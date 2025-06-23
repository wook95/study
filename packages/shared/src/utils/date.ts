import { differenceInDays, format, isToday, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 */
export const formatDateToString = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export const getTodayString = (): string => {
  return formatDateToString(new Date());
};

/**
 * 문자열 날짜를 한국어 형식으로 포맷
 */
export const formatDateToKorean = (dateString: string): string => {
  return format(parseISO(dateString), "yyyy년 MM월 dd일 (eee)", { locale: ko });
};

/**
 * 해당 날짜가 오늘인지 확인
 */
export const isDateToday = (dateString: string): boolean => {
  return isToday(parseISO(dateString));
};

/**
 * 스터디 시작일부터 현재까지의 일수 계산
 */
export const getDaysFromStart = (startDate: string): number => {
  return differenceInDays(new Date(), parseISO(startDate));
};

/**
 * 스터디 전체 기간 일수 계산
 */
export const getTotalStudyDays = (
  startDate: string,
  endDate: string
): number => {
  return differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
};
