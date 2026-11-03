importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// معالجة الإشعارات الواردة وإظهار الـ Popup وتحديث الجرس معاً
self.addEventListener('push', function(event) {
  if (!event.data) return;
  
  try {
    const payload = event.data.json();
    
    // استخراج العنوان والرسالة بمرونة لتدعم إشعارات لوحة OneSignal أو جوجل شيت API
    let title = payload.title || payload.headings?.en || payload.custom?.a?.title || "Miro MarkEt 📦";
    let message = payload.alert || payload.contents?.en || payload.custom?.a?.alert || payload.custom?.a?.message || "تحديث جديد لطلبك";
    
    let options = {
      body: message,
      icon: 'icon.png',
      badge: 'icon.png',
      vibrate: [300, 100, 300],
      tag: 'miro-market-' + Date.now(),
      renotify: true,
      requireInteraction: true,
      data: payload
    };

    // 1. إظهار الإشعار المنبثق (Popup) على شاشة الهاتف
    event.waitUntil(
      Promise.all([
        self.registration.showNotification(title, options),
        // 2. إرسال رسالة لصفحة التطبيق المفتوحة لتحديث جرس الإشعارات داخلياً
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
  } catch (err) {
    console.error("Error handling background push:", err);
  }
});

// التعامل مع الضغط على الإشعار لفتح التطبيق
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});
