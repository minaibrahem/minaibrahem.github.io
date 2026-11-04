importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// التقاط إشارات الـ Push الفعلية لإظهار Popup منبثق وإيقاظ الهاتف حتى وهو مقفل
self.addEventListener('push', function(event) {
  let title = "Miro MarkEt 📦";
  let message = "يوجد تحديث جديد لطلبك";
  let payload = {};

  if (event.data) {
    try {
      payload = event.data.json();
      title = payload.title || payload.headings?.en || payload.headings?.ar || payload.custom?.a?.title || title;
      message = payload.alert || payload.contents?.en || payload.contents?.ar || payload.custom?.a?.alert || payload.custom?.a?.message || message;
    } catch (e) {
      message = event.data.text() || message;
    }
  }

  let options = {
    body: message,
    icon: 'icon.png',
    badge: 'icon.png',
    vibrate: [400, 200, 400, 200, 400],
    tag: 'miro-market-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    priority: 2, // أولوية قصوى لضمان ظهور البوب نوتيفيكيشن والهاتف مغلق
    android: {
      channelId: 'fcm_default_channel',
      sound: 'default',
      priority: 'high'
    },
    data: payload
  };

  event.waitUntil(
    Promise.all([
      // 1. إظهار الإشعار المرئي المنبثق (Popup) على الشاشة
      self.registration.showNotification(title, options),
      
      // 2. إرسال إشارة لتحديث جرس الإشعارات داخل التطبيق إذا كان مفتوحاً في الخلفية
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'NEW_NOTIFICATION_RECEIVED',
            title: title,
            body: message,
            data: payload
          });
        });
      })
    ])
  );
});

// التعامل مع النقر على الإشعار لفتح التطبيق مباشرة
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./index.html');
    })
  );
});
