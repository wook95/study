class NotificationService {
  private static instance: NotificationService;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.init();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async init() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.ready;
        console.log('[NotificationService] Service Worker ready');
      } catch (error) {
        console.error('[NotificationService] Service Worker registration failed:', error);
      }
    }
  }

  /**
   * 알림 권한 요청
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('[NotificationService] This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('[NotificationService] Permission result:', permission);
    return permission;
  }

  /**
   * 즉시 알림 표시
   */
  async showNotification(title: string, options?: NotificationOptions) {
    console.log('[NotificationService] Attempting to show notification:', title);
    
    const permission = await this.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('[NotificationService] Notification permission denied:', permission);
      return;
    }

    const defaultOptions: NotificationOptions = {
      body: '스터디 시간입니다! 📚',
      icon: '/icon-192x192.png',
      badge: '/icon-96x96.png',
      tag: 'study-reminder',
      requireInteraction: true,
      data: {
        url: '/',
        timestamp: Date.now()
      }
    };

    const finalOptions = { ...defaultOptions, ...options };
    console.log('[NotificationService] Final notification options:', finalOptions);

    try {
      if (this.registration?.showNotification) {
        // Service Worker를 통한 알림 (백그라운드에서도 작동)
        console.log('[NotificationService] Using Service Worker notification');
        
        const swOptions = {
          ...finalOptions,
          actions: [
            {
              action: 'open',
              title: '앱 열기',
              icon: '/icon-192x192.png'
            },
            {
              action: 'dismiss',
              title: '닫기'
            }
          ]
        };
        
        await this.registration.showNotification(title, swOptions);
        console.log('[NotificationService] Service Worker notification sent');
      } else {
        // 일반 브라우저 알림 (actions 제외)
        console.log('[NotificationService] Using browser Notification API');
        
        const notification = new Notification(title, finalOptions);
        
        // 알림 이벤트 리스너 추가
        notification.onclick = () => {
          console.log('[NotificationService] Notification clicked');
          window.focus();
          notification.close();
        };
        
        notification.onshow = () => {
          console.log('[NotificationService] Notification shown');
        };
        
        notification.onerror = (error) => {
          console.error('[NotificationService] Notification error:', error);
        };
        
        notification.onclose = () => {
          console.log('[NotificationService] Notification closed');
        };
        
        console.log('[NotificationService] Browser notification created:', notification);
      }
    } catch (error) {
      console.error('[NotificationService] Error showing notification:', error);
      throw error;
    }
  }

  /**
   * 매일 특정 시간에 알림 설정 (WebAPI 기반)
   */
  scheduleDaily(hour = 22, minute = 0) {
    // 기존 스케줄 제거
    this.clearAllSchedules();

    // 설정된 시간을 로컬 스토리지에 저장
    const scheduleInfo = { hour, minute, enabled: true };
    localStorage.setItem('notificationScheduleInfo', JSON.stringify(scheduleInfo));

    const scheduleNotification = () => {
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hour, minute, 0, 0);

      // 이미 해당 시간이 지났으면 다음 날로 설정
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const timeout = scheduledTime.getTime() - now.getTime();

      const timeoutId = setTimeout(async () => {
        await this.showNotification('📚 스터디 시간입니다!', {
          body: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} 스터디 시간! 책을 읽고 오늘의 투두를 완료해보세요!`,
          tag: 'daily-study-reminder',
          icon: '/icon-192x192.png',
          badge: '/icon-96x96.png',
          requireInteraction: true,
          data: {
            type: 'daily-reminder',
            time: `${hour}:${minute}`,
            timestamp: Date.now()
          }
        });

        // 다음 날 알림 다시 스케줄
        scheduleNotification();
      }, timeout);

      // 로컬 스토리지에 스케줄 ID 저장
      localStorage.setItem('notificationScheduleId', timeoutId.toString());
      
      console.log(`[NotificationService] Next notification scheduled for: ${scheduledTime.toLocaleString()}`);
    };

    scheduleNotification();
  }

  /**
   * 모든 예약된 알림 제거
   */
  clearAllSchedules() {
    const scheduleId = localStorage.getItem('notificationScheduleId');
    if (scheduleId) {
      clearTimeout(Number(scheduleId));
      localStorage.removeItem('notificationScheduleId');
      localStorage.removeItem('notificationScheduleInfo');
      console.log('[NotificationService] Cleared existing notification schedule');
    }
  }

  /**
   * 저장된 스케줄 정보 가져오기
   */
  getSavedScheduleInfo() {
    try {
      const saved = localStorage.getItem('notificationScheduleInfo');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('[NotificationService] Error parsing saved schedule info:', error);
    }
    return { hour: 22, minute: 0, enabled: false };
  }

  /**
   * 저장된 스케줄이 있으면 자동으로 재설정
   */
  restoreScheduleIfExists() {
    const scheduleInfo = this.getSavedScheduleInfo();
    const hasActiveSchedule = !!localStorage.getItem('notificationScheduleId');
    
    if (scheduleInfo.enabled && !hasActiveSchedule) {
      console.log('[NotificationService] Restoring saved schedule:', scheduleInfo);
      this.scheduleDaily(scheduleInfo.hour, scheduleInfo.minute);
    }
  }

  /**
   * 테스트용 즉시 알림
   */
  async testNotification() {
    console.log('[NotificationService] Starting test notification...');
    
    // 권한 확인 및 요청
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      console.error('[NotificationService] Permission not granted for test notification');
      throw new Error('알림 권한이 필요합니다. 브라우저에서 알림을 허용해주세요.');
    }

    // Service Worker 준비 대기 (최대 5초)
    let attempts = 0;
    while (!this.registration && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
      if ('serviceWorker' in navigator) {
        try {
          this.registration = await navigator.serviceWorker.ready;
        } catch (e) {
          // 무시하고 계속
        }
      }
    }

    try {
      await this.showNotification('🧪 테스트 알림', {
        body: '알림이 정상적으로 작동합니다! 스터디 응원단이 함께 합니다 📚',
        tag: 'test-notification',
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        requireInteraction: false, // 자동으로 사라지도록
        data: {
          type: 'test',
          timestamp: Date.now()
        }
      });
      
      console.log('[NotificationService] Test notification sent successfully');
    } catch (error) {
      console.error('[NotificationService] Test notification failed:', error);
      throw new Error('테스트 알림 전송에 실패했습니다.');
    }
  }

  /**
   * 브라우저별 알림 지원 여부 확인
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * 현재 알림 권한 상태 확인
   */
  getPermissionStatus(): NotificationPermission {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  }

  /**
   * 알림 설정 정보 가져오기
   */
  getNotificationInfo() {
    return {
      supported: this.isSupported(),
      permission: this.getPermissionStatus(),
      hasSchedule: !!localStorage.getItem('notificationScheduleId'),
      serviceWorkerReady: !!this.registration
    };
  }

  /**
   * 크롬에서 알림 문제 진단
   */
  async diagnoseNotificationIssues() {
    const issues = [];
    
    // 1. 기본 지원 여부
    if (!('Notification' in window)) {
      issues.push('브라우저가 알림을 지원하지 않습니다.');
    }
    
    // 2. 권한 상태
    const permission = this.getPermissionStatus();
    if (permission === 'denied') {
      issues.push('알림 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요.');
    } else if (permission === 'default') {
      issues.push('알림 권한을 요청해야 합니다.');
    }
    
    // 3. Service Worker 상태
    if (!this.registration) {
      issues.push('Service Worker가 준비되지 않았습니다.');
    }
    
    // 4. 사이트별 설정 확인 (가능한 경우)
    try {
      const permissions = await navigator.permissions?.query({ name: 'notifications' as PermissionName });
      if (permissions?.state === 'denied') {
        issues.push('사이트별 알림 권한이 거부되었습니다.');
      }
    } catch (e) {
      // 일부 브라우저에서는 지원하지 않음
    }
    
    return {
      hasIssues: issues.length > 0,
      issues,
      recommendations: this.getRecommendations(issues)
    };
  }

  private getRecommendations(issues: string[]) {
    const recommendations = [];
    
    if (issues.some(issue => issue.includes('권한'))) {
      recommendations.push('브라우저 주소창 왼쪽의 자물쇠 아이콘을 클릭하여 알림을 허용해주세요.');
      recommendations.push('chrome://settings/content/notifications 에서 이 사이트의 알림 설정을 확인해주세요.');
    }
    
    if (issues.some(issue => issue.includes('Service Worker'))) {
      recommendations.push('페이지를 새로고침하여 Service Worker를 다시 로드해보세요.');
    }
    
    recommendations.push('운영체제의 알림 설정에서 크롬 브라우저 알림이 활성화되어 있는지 확인해주세요.');
    recommendations.push('방해 금지 모드나 집중 모드가 활성화되어 있지 않은지 확인해주세요.');
    
    return recommendations;
  }
}

export default NotificationService; 