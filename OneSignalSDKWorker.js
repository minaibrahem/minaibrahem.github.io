importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// معالجة النقر على الإشعار لمنع فتحه في متصفح كروم الخارجي وتوجيهه لداخل التطبيق
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    // تحديد رابط التوجيه (رابط موقعك الأساسي)
    const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : 'https://minaibrahem.github.io/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // البحث عن نافذة مفتوحة للتطبيق لتنشيطها وجلبها للمقدمة
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url.includes('minaibrahem.github.io') && 'focus' in client) {
                    return client.focus();
                }
            }
            // إذا لم تكن النافذة مفتوحة، قم بفتحها داخل التطبيق
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
