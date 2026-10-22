// Service Worker for FocusNest Pomodoro Desktop Notifications
// Ensures notifications pop up on Windows / Mac desktop even when Chrome is minimized or in the background

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for message from main thread to show desktop notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    const notificationOptions = {
      body: options?.body || '',
      icon: options?.icon || '/favicon.ico',
      badge: options?.badge || '/favicon.ico',
      tag: options?.tag || 'focusnest-pomodoro',
      renotify: true,
      requireInteraction: true,
      silent: false,
      data: options?.data || { url: '/' },
    };

    self.registration.showNotification(title, notificationOptions);
  }
});

// When user clicks the desktop notification banner, focus or open the app tab
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
