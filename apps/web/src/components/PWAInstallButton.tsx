import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    showInstallPrompt?: () => void;
  }
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // PWA가 이미 설치되어 있는지 확인
    const checkIfInstalled = () => {
      // standalone 모드인지 확인 (iOS)
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;
      // Chrome PWA인지 확인
      const isInWebApk = window.navigator.userAgent.includes("wv");
      return isStandalone || isInWebApk;
    };

    setIsInstalled(checkIfInstalled());

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    // appinstalled 이벤트 리스너
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("User accepted PWA installation");
      } else {
        console.log("User dismissed PWA installation");
      }

      setDeferredPrompt(null);
      setShowInstallButton(false);
    } catch (error) {
      console.error("Error during PWA installation:", error);
    }
  };

  // 이미 설치되어 있으면 버튼을 보여주지 않음
  if (isInstalled) {
    return null;
  }

  // iOS Safari인 경우 수동 설치 안내
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  if (isIOS && isSafari && !showInstallButton) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <Smartphone className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900 mb-1">
              홈 화면에 앱 추가하기
            </h3>
            <p className="text-sm text-blue-700 mb-2">
              Safari에서 공유 버튼을 눌러 "홈 화면에 추가"를 선택하세요.
            </p>
            <ol className="text-xs text-blue-600 space-y-1">
              <li>1. 화면 하단의 공유 버튼 (□↗) 탭</li>
              <li>2. "홈 화면에 추가" 선택</li>
              <li>3. "추가" 버튼 탭</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Android/Chrome에서 설치 가능한 경우
  if (showInstallButton && deferredPrompt) {
    return (
      <Button
        onClick={handleInstallClick}
        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
        size="lg"
      >
        <Download className="h-4 w-4 mr-2" />
        앱으로 설치하기
      </Button>
    );
  }

  return null;
}
