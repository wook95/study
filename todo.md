# 스터디 응원 앱 개발 TODO

## 🏗️ 프로젝트 초기 설정

### Phase 0: 개발 환경 구성

- [ ] **pnpm workspace 모노레포 구조 설정**
  - [ ] `pnpm-workspace.yaml` 생성
  - [ ] 루트 `package.json` 설정
  - [ ] `apps/`, `packages/` 폴더 구조 생성
- [ ] **공통 패키지 (`packages/shared`) 설정**
  - [ ] TypeScript 기본 설정
  - [ ] 공통 타입 정의 구조
  - [ ] 유틸리티 함수 구조
- [ ] **React 웹앱 (`apps/web`) 설정**
  - [ ] Vite + React + TypeScript 프로젝트 생성
  - [ ] 핵심 라이브러리 설치
    - [ ] React Router (라우팅)
    - [ ] Tailwind CSS + shadcn/ui (스타일링 & UI 컴포넌트)
    - [ ] TanStack Query (서버 상태 관리)
    - [ ] Zustand (전역 상태 관리)
    - [ ] ky (HTTP 클라이언트)
    - [ ] Zod (폼 검증)
    - [ ] date-fns (날짜 처리)
    - [ ] react-hot-toast (알림 토스트)
- [ ] **React Native 앱 (`apps/mobile`) 설정**
  - [ ] React Native CLI로 프로젝트 생성
  - [ ] TypeScript **설정**
  - [ ] React Native WebView 설치
- [ ] **개발 환경 구성**
  - [ ] Node.js, pnpm 설치
  - [ ] Android Studio 설정 (Android 개발용)
  - [ ] Xcode 설정 (iOS 개발용, macOS만)
- [ ] **공통 개발 도구 설정**
  - [ ] Biome 설정 (포맷팅 + 린팅)
  - [ ] 공통 TypeScript 설정
  - [ ] Git 초기화 및 첫 커밋

### Phase 1: Supabase 백엔드 설정

- [ ] **Supabase 프로젝트 설정**
  - [ ] Supabase 프로젝트 생성
  - [ ] `supabase/` 폴더에 로컬 설정 구성
  - [ ] Supabase CLI 설치 및 설정
- [ ] **데이터베이스 스키마 설계 및 생성**
  - [ ] `studies` 테이블 생성
  - [ ] `daily_records` 테이블 생성
  - [ ] `todos` 테이블 생성
  - [ ] 마이그레이션 파일 작성
- [ ] **공통 Supabase 클라이언트 설정**
  - [ ] `packages/shared`에 Supabase 클라이언트 구성
  - [ ] 타입 자동 생성 스크립트 설정
  - [ ] ky 기반 API 클라이언트 함수들 작성
  - [ ] Zod 스키마와 연동된 API 응답 검증
- [ ] **환경변수 설정**
  - [ ] 루트 `.env.example` 파일 생성
  - [ ] 웹앱/모바일앱별 환경변수 설정

## 🎨 UI 컴포넌트 개발

### Phase 2: 기본 컴포넌트 및 레이아웃

- [ ] 전체 앱 레이아웃 컴포넌트 구성
- [ ] 네비게이션 바/탭 바 구현
- [ ] 공통 UI 컴포넌트 제작
  - [ ] Button 컴포넌트
  - [ ] Input 컴포넌트
  - [ ] Modal 컴포넌트
  - [ ] Loading 스피너
- [ ] 반응형 디자인 기본 설정

### Phase 3: 페이지별 컴포넌트 개발

- [ ] 홈/대시보드 페이지
  - [ ] 오늘 날짜 표시
  - [ ] 현재 스터디 정보 요약
  - [ ] 빠른 투두 추가 기능
- [ ] 투두 리스트 페이지
  - [ ] 일일 투두 목록 표시
  - [ ] 투두 추가/삭제 기능
  - [ ] 완료 체크 기능
  - [ ] 날짜별 필터링
- [ ] 캘린더 페이지
  - [ ] 월간 캘린더 뷰 구현
  - [ ] 스터디 기간 하이라이트
  - [ ] 완료/미완료 상태 시각화
  - [ ] 날짜 클릭시 상세 정보

## ⚙️ 핵심 기능 구현

### Phase 4: 데이터 관리 및 상태 관리

- [ ] **TanStack Query 설정 및 서버 상태 관리**
  - [ ] QueryClient 설정 및 Provider 구성
  - [ ] Supabase CRUD 작업을 위한 커스텀 훅 작성
  - [ ] 캐싱 전략 및 무효화 설정
- [ ] **Zustand 전역 상태 관리**
  - [ ] 사용자 설정 상태 (테마, 알림 등)
  - [ ] 앱 전역 상태 (현재 스터디 등)
- [ ] **ky를 이용한 HTTP 클라이언트 설정**
  - [ ] 공통 API 베이스 설정
  - [ ] 에러 핸들링 인터셉터
- [ ] **폼 검증 및 데이터 검증**
  - [ ] Zod 스키마 정의
  - [ ] 폼 검증 훅 작성
- [ ] 로컬 스토리지 연동 (오프라인 대응)

### Phase 5: 스터디 관리 기능 ✅

- [x] 스터디 설정 페이지
  - [x] 스터디 생성 폼 (CreateStudyModal)
  - [x] 시작일/종료일 설정
  - [x] 목표 시간 설정
- [x] 스터디 목록 관리 (다중 스터디 지원)
- [x] 스터디 수정/삭제 기능 (EditStudyModal, StudyActionsMenu)

### Phase 6: 통계 및 진행률 기능

- [ ] 진행률 계산 로직 구현
- [ ] 연속 달성일 카운터
- [ ] 주간/월간 통계 계산
- [ ] 차트 라이브러리 연동 (recharts 등)
- [ ] 통계 페이지 UI 구현

## 📱 고급 기능 구현

### Phase 7: React Native 웹뷰 앱 설정

- [ ] React Native 프로젝트 초기 설정
- [ ] React Native WebView 설치 및 설정
- [ ] 웹앱과 React Native 간 브릿지 통신 구현
- [ ] WebView 설정 최적화 (보안, 성능)

### Phase 8: 네이티브 기능 연동

- [ ] React Native 로컬 푸시 알림 구현
- [ ] 알림 권한 요청 및 스케줄링
- [ ] 앱 아이콘 및 스플래시 스크린 설정
- [ ] 네이티브 스토리지 연동 (AsyncStorage)
- [ ] 앱 상태 관리 (foreground/background)

### Phase 9: 사용자 경험 개선

- [ ] 다크모드/라이트모드 토글
- [ ] 애니메이션 및 마이크로 인터랙션
- [ ] 로딩 상태 및 에러 페이지
- [ ] 접근성 개선 (a11y)
- [ ] 성능 최적화

## 🚀 배포 및 모바일 앱

### Phase 10: 웹 배포

- [ ] Vercel 또는 Netlify 배포 설정
- [ ] 환경변수 배포 환경에서 설정
- [ ] 도메인 연결 (선택사항)
- [ ] HTTPS 설정 확인

### Phase 11: React Native 앱 빌드 및 배포

- [ ] Android 빌드 환경 구성
- [ ] iOS 빌드 환경 구성 (맥 환경 필요)
- [ ] React Native 프로덕션 빌드 최적화
- [ ] 앱 서명 및 릴리즈 준비
- [ ] Google Play Store 및 App Store 업로드 준비

## 🧪 테스트 및 최적화

### Phase 12: 테스트 및 디버깅

- [ ] 기능별 테스트 계획 수립
- [ ] 크로스 브라우저 테스트
- [ ] 모바일 디바이스 테스트
- [ ] 성능 측정 및 최적화
- [ ] 사용자 피드백 수집 및 반영

## 🎯 부가 기능 (Nice to Have)

### Phase 13: 고급 기능 (선택사항)

- [ ] 사용자 인증 시스템 (Supabase Auth)
- [ ] 데이터 백업/복구 기능
- [ ] 스터디 그룹 기능
- [ ] SNS 공유 기능
- [ ] 성취 뱃지 시스템
- [ ] 다국어 지원

## 📋 우선순위별 개발 순서 (권장)

### 🥇 1주차 (핵심 MVP)

1. 프로젝트 초기 설정 (Phase 0)
2. Supabase 설정 (Phase 1)
3. 기본 투두 리스트 기능 (Phase 2-3 일부)

### 🥈 2주차 (기본 기능 완성)

1. 캘린더 뷰 구현 (Phase 3 완료)
2. 데이터 관리 구현 (Phase 4)
3. 기본 스터디 관리 (Phase 5)

### 🥉 3주차 (사용자 경험 개선)

1. 통계 및 진행률 (Phase 6)
2. React Native 웹뷰 앱 설정 (Phase 7)
3. 네이티브 기능 연동 (Phase 8)

### 🏆 4주차 (배포 및 모바일)

1. 웹 배포 (Phase 10)
2. React Native 앱 빌드 및 배포 (Phase 11)
3. 테스트 및 최적화 (Phase 12)

---

**💡 개발 팁**

- 각 Phase는 독립적으로 개발하여 점진적으로 기능 추가
- MVP부터 시작해서 사용자 피드백을 받으며 기능 확장
- 모바일 우선 디자인으로 반응형 구현
- 컴포넌트 재사용성을 고려한 설계
