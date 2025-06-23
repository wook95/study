# 스터디 응원 앱 PRD (Product Requirements Document)

## 📋 프로젝트 개요

**프로젝트명**: 스터디 완주 응원 앱
**목표**: 사용자가 스터디를 꾸준히 완주할 수 있도록 동기부여와 관리 기능을 제공하는 앱

## 🎯 핵심 가치 제안

- 스터디 습관 형성 도움
- 진행률 시각화를 통한 동기부여
- 간단하고 직관적인 인터페이스

## 👥 타겟 사용자

- 온라인/오프라인 스터디에 참여하는 사람들
- 독학으로 공부하며 동기부여가 필요한 사람들
- 습관 형성을 원하는 학습자들

## 🚀 핵심 기능 (MVP)

### 1. 스터디 설정 및 관리

**기능 설명**: 스터디 기본 정보 설정

- 스터디명 입력
- 시작일/종료일 설정
- 일일 목표 시간 설정 (선택사항)
- 스터디 분야/카테고리 선택

### 2. 캘린더 뷰

**기능 설명**: 스터디 진행 상황을 시각적으로 확인

- 월간 캘린더 뷰 제공
- 스터디 시작일~종료일 기간 하이라이트
- 완료한 날짜는 초록색, 미완료는 회색, 오늘은 강조 표시
- 각 날짜 클릭시 상세 정보 확인 가능

### 3. 일일 투두 리스트

**기능 설명**: 하루 스터디 계획 관리

- 오늘의 스터디 과제 추가/삭제
- 체크박스로 완료 표시
- 완료 시간 자동 기록
- 간단한 메모 기능 (선택사항)

### 4. 알림 시스템

**기능 설명**: 스터디 리마인더

- 기본 알림: 밤 10시 "오늘 책 읽으셨나요?" 알림
- 알림 시간 커스터마이징 가능
- 알림 ON/OFF 설정
- React Native 로컬 푸시 알림 활용

### 5. 진행률 대시보드

**기능 설명**: 현재 진행 상황 한눈에 보기

- 전체 기간 대비 현재 진행률 (%)
- 연속 달성일 카운터
- 이번 주 달성률
- 총 완료 과제 수

## 🎨 부가 기능 (Nice to Have)

### 6. 동기부여 시스템

- 달성 뱃지 시스템 (1주 연속, 1개월 완주 등)
- 랜덤 격려 메시지
- 달성시 축하 애니메이션

### 7. 기록 및 회고

- 일일 간단 메모
- 주간 회고 작성
- 학습 내용 키워드 태그

### 8. 설정 및 개인화

- 다크모드/라이트모드
- 테마 색상 변경
- 데이터 내보내기/가져오기

## 🔧 기술적 요구사항

### 프론트엔드 (웹앱)

- **프레임워크**: React 18+
- **빌드 도구**: Vite
- **스타일링**: Tailwind CSS + shadcn/ui
- **서버 상태**: TanStack Query (React Query)
- **전역 상태**: Zustand
- **HTTP 클라이언트**: ky
- **폼 검증**: Zod
- **포맷팅/린팅**: Biome

### 백엔드

- **BaaS**: Supabase
- **데이터베이스**: PostgreSQL (Supabase 기본)
- **인증**: Supabase Auth (선택사항)
- **실시간**: Supabase Realtime (필요시)

### 배포

- **프론트엔드**: Vercel 또는 Netlify
- **모바일**: Capacitor로 웹뷰 앱 변환

## 📊 데이터 모델 (예상)

### Studies 테이블

```sql
- id (UUID, Primary Key)
- name (String) - 스터디명
- start_date (Date) - 시작일
- end_date (Date) - 종료일
- daily_goal_hours (Integer, nullable) - 일일 목표 시간
- category (String, nullable) - 카테고리
- created_at (Timestamp)
```

### Daily_Records 테이블

```sql
- id (UUID, Primary Key)
- study_id (UUID, Foreign Key)
- date (Date)
- is_completed (Boolean)
- completed_at (Timestamp, nullable)
- notes (Text, nullable)
```

### Todos 테이블

```sql
- id (UUID, Primary Key)
- study_id (UUID, Foreign Key)
- date (Date)
- content (String)
- is_completed (Boolean)
- completed_at (Timestamp, nullable)
```

## 🎯 성공 지표

- 사용자의 스터디 완주율 증가
- 앱 일일 사용률
- 연속 사용일 수
- 투두 완료율

## 📱 UI/UX 가이드라인

- **간단함**: 복잡하지 않은 직관적인 인터페이스
- **시각적 피드백**: 완료시 즉각적인 시각적 반응
- **접근성**: 모바일 우선 반응형 디자인
- **일관성**: 일관된 색상과 타이포그래피

## 🚦 출시 단계별 계획

### Phase 1 (MVP)

- 기본 투두 리스트
- 간단한 캘린더 뷰
- 기본 알림 기능

### Phase 2

- 진행률 대시보드
- 스터디 설정 관리
- React Native 앱 기본 구조

### Phase 3

- 동기부여 시스템
- 고급 통계
- 데이터 내보내기
