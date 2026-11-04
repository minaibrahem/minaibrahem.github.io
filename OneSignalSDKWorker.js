importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

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
    priority: 2, // أولوية قصوى لإيقاظ الشاشة والهاتف مقفل
    android: {
      channelId: 'fcm_default_channel',
      sound: 'default',
      priority: 'high'
    },
    data: payload
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
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
