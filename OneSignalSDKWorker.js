importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// معالجة الإشعارات الواردة في الخلفية لضمان ظهورها كـ Popup حتى لو الهاتف مقفل
self.addEventListener('push', function(event) {
  if (!event.data) return;
  
  try {
    let data = event.data.json();
    let title = data.custom?.a?.title || "Miro MarkEt";
    let message = data.custom?.a?.alert || "تحديث جديد من المتجر";
    
    let options = {
      body: message,
      icon: 'icon.png',
      badge: 'icon.png',
      vibrate: [200, 100, 200],
      tag: 'miro-market-notification',
      renotify: true,
      priority: 2, // أولوية قصوى لضمان الظهور والـ Popup
      android: {
        channelId: 'fcm_default_channel',
        sound: 'default'
      }
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
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
