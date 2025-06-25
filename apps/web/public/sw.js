// Service Worker for 스터디 완주 PWA
const CACHE_NAME = "study-eungwon-dan-v1";
const APP_NAME = "스터디 완주";

// 캐시할 파일들
const urlsToCache = [
  "/",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/manifest.json",
];

// Service Worker 설치
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching app shell");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log("[SW] Installation complete");
        return self.skipWaiting();
      })
  );
});

// Service Worker 활성화
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[SW] Activation complete");
        return self.clients.claim();
      })
  );
});

// 네트워크 요청 가로채기 (Cache First 전략)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 캐시에 있으면 캐시에서 반환
      if (response) {
        return response;
      }

      // 캐시에 없으면 네트워크에서 가져오기
      return fetch(event.request)
        .then((response) => {
          // 유효한 응답이 아니면 그대로 반환
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // 응답을 캐시에 저장
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // 네트워크 오류 시 기본 페이지 반환
          if (event.request.destination === "document") {
            return caches.match("/");
          }
        });
    })
  );
});

// 푸시 알림 수신
self.addEventListener("push", (event) => {
  console.log("[SW] Push received:", event);

  let notificationData = {
    title: "📚 스터디 시간입니다!",
    body: "책을 읽고 오늘의 투두를 완료해보세요!",
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    tag: "study-reminder",
    requireInteraction: true,
    actions: [
      {
        action: "open",
        title: "앱 열기",
        icon: "/icon-192x192.png",
      },
      {
        action: "dismiss",
        title: "닫기",
      },
    ],
    data: {
      url: "/",
      timestamp: Date.now(),
    },
  };

  // 서버에서 데이터가 전송된 경우
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = { ...notificationData, ...payload };
    } catch (e) {
      console.log("[SW] Push data is not JSON");
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// 알림 클릭 처리
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event);

  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // 이미 열린 탭이 있으면 포커스
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }

      // 새 탭 열기
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 백그라운드 동기화 (선택사항)
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event);

  if (event.tag === "background-sync") {
    event.waitUntil(
      // 여기에 백그라운드에서 실행할 작업 추가
      console.log("[SW] Background sync completed")
    );
  }
});

// 주기적 백그라운드 동기화 (예: 매일 밤 10시 알림)
self.addEventListener("periodicsync", (event) => {
  console.log("[SW] Periodic sync:", event);

  if (event.tag === "daily-study-reminder") {
    event.waitUntil(sendStudyReminder());
  }
});

// 스터디 알림 전송 함수
async function sendStudyReminder() {
  const now = new Date();
  const hour = now.getHours();

  // 밤 10시에만 알림 전송
  if (hour === 22) {
    return self.registration.showNotification("📚 스터디 시간입니다!", {
      body: "책을 읽고 오늘의 투두를 완료해보세요!",
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      tag: "daily-study-reminder",
      requireInteraction: true,
      data: {
        url: "/",
        timestamp: Date.now(),
      },
    });
  }
}
