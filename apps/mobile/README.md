# 스터디 완주 모바일 앱 📱

**React Native (Expo) + WebView** 기반 모바일 앱입니다.

## 🎯 **주요 기능**

- **앱 아이콘**: 스터디 완주 컨셉 (책 + 체크마크)
- **스플래시 스크린**: 브랜드 그라데이션 배경 (#667eea ~ #764ba2)
- **WebView 기반**: 웹앱을 모바일 앱으로 감싸는 하이브리드 앱
- **네이티브 경험**: Android 백 버튼, 풀 투 리프레시 지원
- **📢 푸시 알림**: 매일 밤 10시 스터디 알림 (로컬 알림)
- **오프라인 대응**: 네트워크 오류 시 사용자 친화적 알림
- **크로스 플랫폼**: iOS/Android 동시 지원

## 🚀 **실행 방법**

### **개발 환경**

```bash
# 루트에서 실행
pnpm dev:mobile

# 또는 모바일 폴더에서 직접 실행
cd apps/mobile
pnpm start
```

### **빌드**

```bash
# Android APK 빌드
pnpm android

# iOS 앱 빌드 (macOS 필요)
pnpm ios

# 웹 빌드 (테스트용)
pnpm web
```

## 🔧 **기술 스택**

- **React Native**: 0.79.4
- **React**: 18.2.0 (타입 호환성)
- **Expo**: ~53.0.12
- **react-native-webview**: ^13.15.0
- **expo-notifications**: ^0.31.3 (푸시 알림)

## 📱 **앱 설정**

### **개발 모드**

- 웹앱 URL: `http://localhost:5173`
- Hot Reload 지원
- **알림 테스트 UI**: 개발 환경에서만 우상단에 표시

### **프로덕션 모드**

- 웹앱 URL: `https://your-domain.com` (TODO: 실제 도메인 설정)

## 🔔 **푸시 알림 기능**

### **기능**

- **매일 밤 10시 스터디 알림**: "📚 스터디 시간입니다! 책을 읽고 오늘의 투두를 완료해보세요!"
- **로컬 알림**: 네트워크 없이도 작동
- **권한 관리**: 앱 시작시 자동 권한 요청
- **테스트 기능**: 개발 환경에서 즉시 테스트 가능

### **권한 설정**

- **iOS**: `NSUserNotificationsUsageDescription` 설정
- **Android**: `NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`, `VIBRATE`, `WAKE_LOCK` 권한

### **개발 테스트**

개발 환경에서 앱을 실행하면 우상단에 **알림 테스트 UI**가 표시됩니다:

- 즉시 테스트 알림
- 스터디 알림 설정/취소
- 권한 상태 확인
- 예약된 알림 목록 확인

## 🛠 **주요 파일**

- `App.tsx`: 메인 WebView 컴포넌트 + 알림 초기화
- `src/services/NotificationService.ts`: 알림 관리 서비스
- `src/components/NotificationTest.tsx`: 개발용 테스트 UI
- `app.json`: Expo 설정 파일 (알림 권한 포함)
- `package.json`: 의존성 및 스크립트

## 📋 **TODO**

- [x] 기본 WebView 구현
- [x] 푸시 알림 서비스 구현
- [x] 밤 10시 스터디 알림 스케줄
- [x] 알림 권한 관리
- [x] 개발용 테스트 UI
- [ ] 실제 도메인으로 프로덕션 URL 변경
- [x] 앱 아이콘 및 스플래시 이미지 커스터마이징
- [ ] App Store/Play Store 배포 준비

## 🎨 **아이콘 커스터마이징**

### **아이콘 생성 가이드**

1. **HTML 생성기 사용**:

   ```bash
   node scripts/generate-icons.js
   open icon-generator.html
   ```

2. **브라우저에서 작업**:

   - "🎨 모든 아이콘 생성" 클릭
   - "🌟 스플래시 생성" 클릭
   - 다운로드된 파일을 `assets/` 폴더에 저장

3. **필요한 파일들**:
   - `icon.png` (1024x1024): 메인 앱 아이콘
   - `adaptive-icon.png` (1024x1024): Android 적응형 아이콘
   - `splash-icon.png` (1284x2778): 스플래시 스크린
   - `favicon.png` (48x48): 웹 파비콘

### **디자인 컨셉**

- **📚 책**: 스터디를 상징
- **✅ 체크마크**: 완주/완료를 상징
- **컬러**: `#667eea` ~ `#764ba2` 그라데이션
- **스타일**: 모던하고 깔끔한 플랫 디자인

## 🐛 **문제 해결**

### **알림이 작동하지 않는 경우**

1. 디바이스의 알림 권한 확인
2. 물리적 기기에서 테스트 (시뮬레이터에서는 제한적)
3. 개발용 테스트 UI로 권한 상태 확인

### **타입 오류**

- React 18/19 간 타입 호환성 문제로 인한 린터 오류
- 실제 실행에는 문제 없음
