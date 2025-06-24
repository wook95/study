# 스터디 완주 - 웹 애플리케이션

React와 TypeScript로 개발된 스터디 완주를 위한 응원 웹 애플리케이션입니다.

## 🌟 주요 기능

### 📝 스터디 관리

- 스터디 생성 및 편집
- 일일 할 일 관리
- 스터디 진행 상황 추적

### 📅 캘린더 뷰

- 월별 스터디 현황 확인
- 날짜별 상세 할 일 보기
- 스터디 완료 상태 시각화

### 📊 통계 및 분석

- 주간/월간 통계
- 연속 완주 기록 (Streak Counter)
- 진행률 차트 및 분석

### 🔐 사용자 인증 시스템

- **회원가입 & 로그인**

  - 이메일/비밀번호 기반 인증
  - 실시간 유효성 검사
  - 비밀번호 강도 확인

- **비밀번호 관리**

  - 비밀번호 재설정 (이메일 링크)
  - 프로필에서 비밀번호 변경
  - 보안 강화된 비밀번호 정책

- **이메일 확인**

  - 회원가입 후 이메일 인증
  - 인증 이메일 재전송
  - 자동 이메일 확인 처리

- **프로필 관리**

  - 기본 정보 수정 (이름)
  - 비밀번호 변경
  - 계정 삭제 옵션

- **보호된 라우트**
  - 로그인 필요 페이지 자동 보호
  - 인증 상태 기반 리다이렉트
  - 세션 관리 및 자동 로그아웃

## 🎨 UI/UX 특징

- **현대적인 디자인**: Tailwind CSS + shadcn/ui 컴포넌트
- **반응형 웹**: 모바일, 태블릿, 데스크톱 지원
- **그라데이션 디자인**: 인디고-퍼플 컬러 테마
- **직관적인 인터페이스**: 사용자 친화적 네비게이션
- **실시간 피드백**: Toast 알림 시스템

## 🛠 기술 스택

### Frontend

- **React 18** - 사용자 인터페이스
- **TypeScript** - 타입 안정성
- **Vite** - 빠른 개발 환경
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **shadcn/ui** - 재사용 가능한 UI 컴포넌트

### 상태 관리 & 데이터

- **Zustand** - 경량 상태 관리
- **React Router** - 클라이언트 사이드 라우팅
- **React Hook Form** - 폼 관리
- **Zod** - 스키마 검증

### 백엔드 & 인증

- **Supabase** - BaaS (Backend as a Service)
- **Supabase Auth** - 인증 시스템
- **PostgreSQL** - 데이터베이스 (Supabase)

### 개발 도구

- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포맷팅
- **pnpm** - 패키지 관리

## 📱 페이지 구조

### 공개 페이지

- `/login` - 로그인
- `/signup` - 회원가입
- `/forgot-password` - 비밀번호 재설정 요청
- `/reset-password` - 새 비밀번호 설정
- `/verify-email` - 이메일 확인 완료

### 보호된 페이지 (로그인 필요)

- `/` - 홈 (오늘의 할 일)
- `/calendar` - 캘린더 뷰
- `/statistics` - 통계 대시보드
- `/study/:id` - 스터디 상세
- `/profile` - 프로필 설정

### 기타

- `/*` - 404 페이지 (NotFound)

## 🚀 개발 환경 설정

```bash
# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm dev

# 빌드
pnpm build

# 프리뷰
pnpm preview
```

## 📦 프로젝트 구조

```
apps/web/
├── public/          # 정적 파일
├── src/
│   ├── components/  # 재사용 컴포넌트
│   │   ├── ui/     # shadcn/ui 컴포넌트
│   │   ├── CreateStudyModal.tsx
│   │   ├── Navigation.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── ...
│   ├── hooks/      # 커스텀 훅
│   │   ├── useAuth.ts
│   │   └── use-toast.ts
│   ├── lib/        # 유틸리티 & 설정
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── pages/      # 페이지 컴포넌트
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── ...
│   └── App.tsx     # 메인 앱 컴포넌트
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🔑 환경 변수

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🌐 배포

### Vercel (권장)

1. GitHub 저장소 연결
2. 환경 변수 설정
3. 자동 배포

### Netlify

1. 빌드 명령어: `pnpm build`
2. 퍼블리시 디렉토리: `dist`
3. 환경 변수 설정

## 🤝 기여 방법

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

MIT License

---

**스터디 완주 애플리케이션** - 여러분의 학습 여정을 응원합니다! 🎓
