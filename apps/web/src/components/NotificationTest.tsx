import { Bell, BellOff, TestTube } from "lucide-react";
import { useEffect, useState } from "react";
import NotificationService from "../services/NotificationService";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function NotificationTest() {
  const [notificationInfo, setNotificationInfo] = useState({
    supported: false,
    permission: "denied" as NotificationPermission,
    hasSchedule: false,
    serviceWorkerReady: false,
  });

  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    updateNotificationInfo();

    // 주기적으로 상태 업데이트
    const interval = setInterval(updateNotificationInfo, 2000);
    return () => clearInterval(interval);
  }, []);

  const updateNotificationInfo = () => {
    setNotificationInfo(notificationService.getNotificationInfo());
  };

  const handleRequestPermission = async () => {
    await notificationService.requestPermission();
    updateNotificationInfo();
  };

  const handleTestNotification = async () => {
    await notificationService.testNotification();
  };

  const handleScheduleDaily = () => {
    notificationService.scheduleDaily(22, 0); // 매일 밤 10시
    updateNotificationInfo();
  };

  const handleClearSchedule = () => {
    notificationService.clearAllSchedules();
    updateNotificationInfo();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          푸시 알림 테스트
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 상태 정보 */}
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span>브라우저 지원:</span>
            <span
              className={
                notificationInfo.supported ? "text-green-600" : "text-red-600"
              }
            >
              {notificationInfo.supported ? "✅ 지원" : "❌ 미지원"}
            </span>
          </div>

          <div className="flex justify-between">
            <span>알림 권한:</span>
            <span
              className={`${
                notificationInfo.permission === "granted"
                  ? "text-green-600"
                  : notificationInfo.permission === "denied"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {notificationInfo.permission === "granted"
                ? "✅ 허용"
                : notificationInfo.permission === "denied"
                ? "❌ 거부"
                : "⏳ 대기"}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Service Worker:</span>
            <span
              className={
                notificationInfo.serviceWorkerReady
                  ? "text-green-600"
                  : "text-yellow-600"
              }
            >
              {notificationInfo.serviceWorkerReady ? "✅ 준비" : "⏳ 로딩"}
            </span>
          </div>

          <div className="flex justify-between">
            <span>매일 알림:</span>
            <span
              className={
                notificationInfo.hasSchedule
                  ? "text-green-600"
                  : "text-gray-600"
              }
            >
              {notificationInfo.hasSchedule ? "✅ 활성" : "⭕ 비활성"}
            </span>
          </div>
        </div>

        {/* 컨트롤 버튼들 */}
        <div className="space-y-2">
          {notificationInfo.permission !== "granted" && (
            <Button
              onClick={handleRequestPermission}
              className="w-full"
              variant="outline"
            >
              <Bell className="h-4 w-4 mr-2" />
              알림 권한 요청
            </Button>
          )}

          <Button
            onClick={handleTestNotification}
            className="w-full"
            disabled={notificationInfo.permission !== "granted"}
          >
            <TestTube className="h-4 w-4 mr-2" />
            테스트 알림 보내기
          </Button>

          {!notificationInfo.hasSchedule ? (
            <Button
              onClick={handleScheduleDaily}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={notificationInfo.permission !== "granted"}
            >
              <Bell className="h-4 w-4 mr-2" />
              매일 밤 10시 알림 설정
            </Button>
          ) : (
            <Button
              onClick={handleClearSchedule}
              className="w-full"
              variant="destructive"
            >
              <BellOff className="h-4 w-4 mr-2" />
              알림 스케줄 제거
            </Button>
          )}
        </div>

        {/* 도움말 */}
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
          <p className="font-medium mb-1">💡 알림 기능 안내:</p>
          <ul className="space-y-1">
            <li>• 브라우저에서 알림 권한을 허용해주세요</li>
            <li>• iOS Safari는 홈 화면 추가 후 알림 지원</li>
            <li>• 백그라운드에서도 알림이 작동합니다</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
