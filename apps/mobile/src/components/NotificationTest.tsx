import type React from "react";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NotificationService } from "../services/NotificationService";

export const NotificationTest: React.FC = () => {
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    checkScheduledNotifications();
  }, []);

  const checkScheduledNotifications = async () => {
    const notifications = await notificationService.getScheduledNotifications();
    setScheduledCount(notifications.length);
    setIsScheduled(notifications.length > 0);
  };

  const handleTestNotification = async () => {
    await notificationService.sendTestNotification();
    Alert.alert("✅ 테스트 알림", "1초 후에 알림이 표시됩니다!");
  };

  const handleScheduleStudyReminder = async () => {
    const identifier = await notificationService.scheduleStudyReminder();
    if (identifier) {
      setIsScheduled(true);
      await checkScheduledNotifications();
      Alert.alert("📅 알림 설정", "매일 밤 10시 스터디 알림이 설정되었습니다!");
    } else {
      Alert.alert("❌ 설정 실패", "알림 권한을 확인해주세요.");
    }
  };

  const handleCancelReminder = async () => {
    await notificationService.cancelStudyReminder();
    setIsScheduled(false);
    await checkScheduledNotifications();
    Alert.alert("🔕 알림 취소", "스터디 알림이 취소되었습니다.");
  };

  const handleCheckPermission = async () => {
    const hasPermission = await notificationService.checkPermissionStatus();
    Alert.alert(
      "알림 권한 상태",
      hasPermission ? "✅ 권한이 허용되었습니다." : "❌ 권한이 거부되었습니다."
    );
  };

  // 개발 환경에서만 표시
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 알림 테스트</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>예약된 알림: {scheduledCount}개</Text>
        <Text style={styles.statusText}>
          스터디 알림: {isScheduled ? "✅ 활성" : "❌ 비활성"}
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleTestNotification}>
        <Text style={styles.buttonText}>즉시 테스트 알림</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          isScheduled ? styles.cancelButton : styles.scheduleButton,
        ]}
        onPress={
          isScheduled ? handleCancelReminder : handleScheduleStudyReminder
        }
      >
        <Text style={styles.buttonText}>
          {isScheduled ? "스터디 알림 취소" : "스터디 알림 설정"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleCheckPermission}>
        <Text style={styles.buttonText}>권한 상태 확인</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={checkScheduledNotifications}
      >
        <Text style={styles.buttonText}>알림 목록 새로고침</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 100,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 10,
    borderRadius: 8,
    minWidth: 200,
    zIndex: 1000,
  },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  statusContainer: {
    marginBottom: 10,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 4,
    marginBottom: 5,
  },
  scheduleButton: {
    backgroundColor: "#34C759",
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
  },
});
