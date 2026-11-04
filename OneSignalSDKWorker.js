importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// معالجة الإشعارات الواردة في الخلفية لضمان ظهورها كـ Popup حتى لو الهاتف مقفل (سواء من OneSignal أو جوجل شيت)
self.addEventListener('push', function(event) {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    // استخراج العنوان والرسالة بمرونة تامة لتشمل إشعارات جوجل شيت ولوحة التحكم
    let title = data.title || data.headings?.en || data.custom?.a?.title || "Miro MarkEt 📦";
    let message = data.alert || data.contents?.en || data.custom?.a?.alert || data.custom?.a?.message || "يوجد تحديث جديد لطلبك";
    
    let options = {
      body: message,
      icon: 'icon.png',
      badge: 'icon.png',
      vibrate: [300, 100, 300, 100, 300],
      tag: 'miro-market-' + Date.now(),
      renotify: true,
      requireInteraction: true,
      priority: 2, // أولوية قصوى لإيقاظ الشاشة وعرض الـ Popup والهاتف مقفل
      android: {
        channelId: 'fcm_default_channel',
        sound: 'default'
      },
      data: data
    };

    event.waitUntil(
      Promise.all([
        // 1. إظهار الإشعار المنبثق (Popup)
        self.registration.showNotification(title, options),
        
        // 2. إرسال إشارة لصفحة التطبيق لتحديث الجرس داخلياً
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'NEW_NOTIFICATION_RECEIVED',
              title: title,
              body: message,
              data: data
            });
          });
        })
      ])
    );
  } catch (err) {
    console.error("Error handling background push:", err);
  }
});

// التعامل مع الضغط على الإشعار لفتح التطبيق مباشرة
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
