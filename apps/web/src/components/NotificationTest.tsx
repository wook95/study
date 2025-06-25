import { Bell, BellOff, Clock, TestTube } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import NotificationService from "../services/NotificationService";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function NotificationTest() {
  const [notificationInfo, setNotificationInfo] = useState({
    supported: false,
    permission: "denied" as NotificationPermission,
    hasSchedule: false,
    serviceWorkerReady: false,
  });

  const [selectedTime, setSelectedTime] = useState({
    hour: 22,
    minute: 0,
  });

  const [isTestingNotification, setIsTestingNotification] = useState(false);

  const notificationService = NotificationService.getInstance();

  const updateNotificationInfo = useCallback(() => {
    setNotificationInfo(notificationService.getNotificationInfo());
  }, [notificationService]);

  useEffect(() => {
    // 저장된 스케줄 정보 불러오기
    const savedSchedule = notificationService.getSavedScheduleInfo();
    if (savedSchedule.enabled) {
      setSelectedTime({
        hour: savedSchedule.hour,
        minute: savedSchedule.minute,
      });
    }

    updateNotificationInfo();

    // 주기적으로 상태 업데이트
    const interval = setInterval(updateNotificationInfo, 2000);
    return () => clearInterval(interval);
  }, [notificationService, updateNotificationInfo]);

  const handleRequestPermission = async () => {
    try {
      await notificationService.requestPermission();
      updateNotificationInfo();
    } catch (error) {
      console.error("권한 요청 실패:", error);
    }
  };

  const handleTestNotification = async () => {
    if (isTestingNotification) return;

    setIsTestingNotification(true);
    try {
      await notificationService.testNotification();
      console.log("테스트 알림 전송 완료");
    } catch (error) {
      console.error("테스트 알림 실패:", error);
    } finally {
      setTimeout(() => setIsTestingNotification(false), 2000);
    }
  };

  const handleScheduleDaily = () => {
    try {
      notificationService.scheduleDaily(selectedTime.hour, selectedTime.minute);
      updateNotificationInfo();
      console.log(
        `매일 ${selectedTime.hour}:${selectedTime.minute
          .toString()
          .padStart(2, "0")} 알림 설정됨`
      );
    } catch (error) {
      console.error("알림 스케줄 설정 실패:", error);
    }
  };

  const handleClearSchedule = () => {
    try {
      notificationService.clearAllSchedules();
      updateNotificationInfo();
      console.log("알림 스케줄 제거됨");
    } catch (error) {
      console.error("알림 스케줄 제거 실패:", error);
    }
  };

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  const handleDiagnoseIssues = async () => {
    try {
      const diagnosis = await notificationService.diagnoseNotificationIssues();
      console.log("[Diagnosis] Notification issues:", diagnosis);

      if (diagnosis.hasIssues) {
        const issueList = diagnosis.issues.join("\n• ");
        const recommendationList = diagnosis.recommendations.join("\n• ");
        alert(
          `🔍 알림 문제 진단 결과:\n\n📋 발견된 문제:\n• ${issueList}\n\n💡 해결 방법:\n• ${recommendationList}`
        );
      } else {
        alert("✅ 알림 설정에 문제가 없습니다. 다른 원인을 확인해보세요.");
      }
    } catch (error) {
      console.error("[Diagnosis] Failed to diagnose:", error);
      alert(`진단 중 오류가 발생했습니다: ${error}`);
    }
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
        <div className="space-y-3">
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
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={
              notificationInfo.permission !== "granted" || isTestingNotification
            }
          >
            <TestTube className="h-4 w-4 mr-2" />
            {isTestingNotification
              ? "알림 전송 중..."
              : "즉시 테스트 알림 보내기"}
          </Button>

          {/* 간단한 브라우저 알림 테스트 */}
          <Button
            onClick={async () => {
              try {
                console.log("[Simple Test] Creating simple notification...");
                const notification = new Notification("🧪 간단 테스트", {
                  body: "이 알림이 보이면 브라우저 알림이 정상 작동합니다!",
                  icon: "/icon-192x192.png",
                });

                notification.onshow = () => {
                  console.log("[Simple Test] Notification shown successfully");
                };

                notification.onerror = (error) => {
                  console.error("[Simple Test] Notification error:", error);
                };

                console.log(
                  "[Simple Test] Simple notification created:",
                  notification
                );
              } catch (error) {
                console.error(
                  "[Simple Test] Failed to create notification:",
                  error
                );
                alert(`알림 생성 실패: ${error}`);
              }
            }}
            className="w-full bg-purple-600 hover:bg-purple-700"
            variant="outline"
            disabled={notificationInfo.permission !== "granted"}
          >
            <TestTube className="h-4 w-4 mr-2" />
            간단 브라우저 알림 테스트
          </Button>

          {/* 알림 문제 진단 */}
          <Button
            onClick={handleDiagnoseIssues}
            className="w-full bg-orange-600 hover:bg-orange-700"
            variant="outline"
          >
            🔍 알림 문제 진단하기
          </Button>

          {/* 시간 선택 섹션 */}
          <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              매일 알림 시간 설정
            </Label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="hour" className="text-xs">
                  시간
                </Label>
                <Input
                  id="hour"
                  type="number"
                  min="0"
                  max="23"
                  value={selectedTime.hour}
                  onChange={(e) =>
                    setSelectedTime((prev) => ({
                      ...prev,
                      hour: Math.max(
                        0,
                        Math.min(23, Number.parseInt(e.target.value) || 0)
                      ),
                    }))
                  }
                  className="text-center"
                />
              </div>
              <div>
                <Label htmlFor="minute" className="text-xs">
                  분
                </Label>
                <Input
                  id="minute"
                  type="number"
                  min="0"
                  max="59"
                  value={selectedTime.minute}
                  onChange={(e) =>
                    setSelectedTime((prev) => ({
                      ...prev,
                      minute: Math.max(
                        0,
                        Math.min(59, Number.parseInt(e.target.value) || 0)
                      ),
                    }))
                  }
                  className="text-center"
                />
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              선택된 시간:{" "}
              <span className="font-medium">
                {formatTime(selectedTime.hour, selectedTime.minute)}
              </span>
            </div>

            {!notificationInfo.hasSchedule ? (
              <Button
                onClick={handleScheduleDaily}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={notificationInfo.permission !== "granted"}
              >
                <Bell className="h-4 w-4 mr-2" />
                매일 {formatTime(selectedTime.hour, selectedTime.minute)} 알림
                설정
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
        </div>

        {/* 도움말 */}
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
          <p className="font-medium mb-1">💡 알림 기능 안내:</p>
          <ul className="space-y-1">
            <li>• 브라우저에서 알림 권한을 허용해주세요</li>
            <li>• 테스트 알림은 즉시 전송됩니다</li>
            <li>• 시간을 선택하여 매일 알림을 설정할 수 있습니다</li>
            <li>• iOS Safari는 홈 화면 추가 후 알림 지원</li>
            <li>• 백그라운드에서도 알림이 작동합니다</li>
          </ul>
        </div>

        {/* 크롬 알림 문제 해결 */}
        <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded border border-blue-200">
          <p className="font-medium mb-1">🔧 크롬에서 알림이 안 보이나요?</p>
          <ul className="space-y-1">
            <li>
              • 브라우저 설정 → 개인정보 및 보안 → 사이트 설정 → 알림에서
              허용되어 있는지 확인
            </li>
            <li>• 운영체제 알림 설정에서 크롬 알림이 활성화되어 있는지 확인</li>
            <li>• 방해 금지 모드나 집중 모드가 켜져있지 않은지 확인</li>
            <li>• F12 → Console에서 알림 관련 에러 메시지 확인</li>
          </ul>
          <div className="mt-2 pt-2 border-t border-blue-200">
            <p className="font-medium">빠른 확인:</p>
            <p>
              • 현재 사이트:{" "}
              <span className="font-mono bg-white px-1 rounded">
                {window.location.origin}
              </span>
            </p>
            <p>
              • 알림 권한:{" "}
              <span className="font-mono bg-white px-1 rounded">
                {notificationInfo.permission}
              </span>
            </p>
            <p>
              • Service Worker:{" "}
              <span className="font-mono bg-white px-1 rounded">
                {notificationInfo.serviceWorkerReady ? "준비됨" : "로딩중"}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
