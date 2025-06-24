# 스터디 완주 모바일 앱 📱

**React Native (Expo) + WebView** 기반 모바일 앱입니다.

## 🎯 **주요 기능**

- **WebView 기반**: 웹앱을 모바일 앱으로 감싸는 하이브리드 앱
- **네이티브 경험**: Android 백 버튼, 풀 투 리프레시 지원
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

## 📱 **앱 설정**

### **개발 모드**

- 웹앱 URL: `http://localhost:5173`
- Hot Reload 지원

### **프로덕션 모드**

- 웹앱 URL: `https://your-domain.com` (TODO: 실제 도메인 설정)

## 🛠 **주요 파일**

- `App.tsx`: 메인 WebView 컴포넌트
- `app.json`: Expo 설정 파일
- `package.json`: 의존성 및 스크립트

## 📋 **TODO**

- [ ] 실제 도메인으로 프로덕션 URL 변경
- [ ] 앱 아이콘 및 스플래시 이미지 커스터마이징
- [ ] 푸시 알림 구현
- [ ] App Store/Play Store 배포 준비
