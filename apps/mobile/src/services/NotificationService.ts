import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 알림 기본 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private static instance: NotificationService;
  private notificationPermission = false;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * 알림 권한 요청
   */
  async requestPermissions(): Promise<boolean> {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('알림 권한이 거부되었습니다.');
        this.notificationPermission = false;
        return false;
      }

      this.notificationPermission = true;
      return true;
    }
    
    console.log('물리적 기기에서만 푸시 알림을 사용할 수 있습니다.');
    return false;
  }

  /**
   * Android 알림 채널 설정
   */
  async setupAndroidChannel(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('study-reminders', {
        name: '스터디 알림',
        description: '스터디 시간 알림을 받을 수 있습니다.',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }
  }

  /**
   * 밤 10시 책 읽기 알림 스케줄
   */
  async scheduleStudyReminder(): Promise<string | null> {
    if (!this.notificationPermission) {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;
    }

    try {
      // 기존 알림 취소
      await this.cancelStudyReminder();

      // 매일 밤 10시에 알림 스케줄
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📚 스터디 시간입니다!',
          body: '책을 읽고 오늘의 투두를 완료해보세요!',
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'study-reminder',
        },
        trigger: {
          hour: 22, // 밤 10시
          minute: 0,
          repeats: true,
          channelId: 'study-reminders',
        },
      });

      console.log('📅 매일 밤 10시 스터디 알림이 설정되었습니다.', identifier);
      return identifier;
    } catch (error) {
      console.error('알림 스케줄 설정 실패:', error);
      return null;
    }
  }

  /**
   * 스터디 알림 취소
   */
  async cancelStudyReminder(): Promise<void> {
    try {
      // 모든 예약된 알림 가져오기
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      // 스터디 관련 알림 필터링 및 취소
      const studyNotifications = scheduledNotifications.filter(
        notification => 
          notification.content.categoryIdentifier === 'study-reminder' ||
          notification.content.title?.includes('스터디')
      );

      for (const notification of studyNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }

      console.log('🔕 스터디 알림이 취소되었습니다.');
    } catch (error) {
      console.error('알림 취소 실패:', error);
    }
  }

  /**
   * 즉시 테스트 알림 전송
   */
  async sendTestNotification(): Promise<void> {
    if (!this.notificationPermission) {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 테스트 알림',
          body: '알림이 정상적으로 작동합니다!',
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
        },
      });

      console.log('✅ 테스트 알림이 전송되었습니다.');
    } catch (error) {
      console.error('테스트 알림 전송 실패:', error);
    }
  }

  /**
   * 모든 예약된 알림 조회
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('예약된 알림 조회 실패:', error);
      return [];
    }
  }

  /**
   * 알림 권한 상태 확인
   */
  async checkPermissionStatus(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    this.notificationPermission = status === 'granted';
    return this.notificationPermission;
  }
} 