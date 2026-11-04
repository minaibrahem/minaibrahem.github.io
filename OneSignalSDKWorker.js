importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// معالجة شاملة لضمان ظهور الـ Popup والهاتف مقفل (سواء من OneSignal أو جوجل شيت)
self.addEventListener('push', function(event) {
  let payload = {};
  
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { body: event.data.text() };
    }
  }
  
  // استخراج العنوان والرسالة باحترافية من كل الاحتمالات الممكنة لإرسال جوجل شيت أو لوحة التحكم
  let title = payload.headings?.en || payload.title || payload.custom?.a?.title || "Miro MarkEt 📦";
  let message = payload.contents?.en || payload.alert || payload.body || payload.custom?.a?.alert || payload.custom?.a?.message || "يوجد تحديث جديد لطلبك";

  let options = {
    body: message,
    icon: 'icon.png',
    badge: 'icon.png',
    vibrate: [300, 100, 300, 100, 300],
    tag: 'miro-market-' + Date.now(),
    renotify: true,
    requireInteraction: true, // يظل الإشعار ظاهراً على الشاشة حتى يتفاعل معه المستخدم
    priority: 2, // أولوية قصوى لإيقاظ الشاشة وعرض الـ Popup والجهد مقفل
    android: {
      channelId: 'fcm_default_channel',
      sound: 'default'
    },
    data: payload
  };

  event.waitUntil(
    Promise.all([
      // 1. إظهار الإشعار المنبثق كـ Popup فوري
      self.registration.showNotification(title, options),
      
      // 2. إرسال البيانات للواجهة لتحديث الجرس داخلياً
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
