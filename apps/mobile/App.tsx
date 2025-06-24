import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from "react-native";
import { WebView } from "react-native-webview";

export default function App() {
  const [canGoBack, setCanGoBack] = useState(false);
  const [webViewRef, setWebViewRef] = useState<WebView | null>(null);

  // 웹앱 URL (개발시: localhost, 프로덕션시: 실제 도메인)
  const WEB_APP_URL = __DEV__
    ? "http://localhost:5173"
    : "https://your-domain.com"; // TODO: 실제 배포 도메인으로 변경

  // Android 백 버튼 처리
  useEffect(() => {
    if (Platform.OS === "android") {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (canGoBack && webViewRef) {
            webViewRef.goBack();
            return true;
          }
          return false;
        }
      );

      return () => backHandler.remove();
    }
  }, [canGoBack, webViewRef]);

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
  };

  const handleError = () => {
    Alert.alert("연결 오류", "인터넷 연결을 확인하고 다시 시도해주세요.", [
      { text: "확인" },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="auto" />

      <WebView
        ref={(ref) => setWebViewRef(ref)}
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onError={handleError}
        onHttpError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        startInLoadingState={true}
        scalesPageToFit={true}
        bounces={false}
        scrollEnabled={true}
        // iOS에서 상단 노치 영역 처리
        contentInsetAdjustmentBehavior="automatic"
        // Android에서 하드웨어 가속 활성화
        androidHardwareAccelerationDisabled={false}
        // Pull to refresh 활성화
        pullToRefreshEnabled={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
  },
});
