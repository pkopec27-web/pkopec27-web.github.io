// Powiadomienia z czatu klasy (3.11) w przeglądarce. Treść przychodzi zaszyfrowana z funkcji serwera „powiadom”
// (sam tytuł z nazwą klasy i rodzaj: bez treści wiadomości i autora). Stuknięcie otwiera czat w tej samej karcie
// aplikacji albo w nowej. Nic więcej ten plik nie robi (bez pamięci podręcznej i bez zapytań do sieci).
const PATHS = ['/czat', '/klasa'];
const text = (v, max) => (typeof v === 'string' ? Array.from(v.replace(/[\u0000-\u001f\u007f]/g, '')).slice(0, max).join('') : '');

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = {}; }
  const title = text(data.title, 60) || 'Frekwencja+';
  const url = PATHS.indexOf(data.url) >= 0 ? data.url : '/klasa';
  const tag = /^[a-z]+-[0-9a-f-]{36}$/.test(data.tag || '') ? data.tag : 'frekwencja';
  event.waitUntil(self.registration.showNotification(title, {
    body: text(data.body, 120), tag, renotify: false, icon: '/icon-192.png', badge: '/icon-192.png', lang: 'pl', data: { url },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data && PATHS.indexOf(event.notification.data.url) >= 0 ? event.notification.data.url : '/klasa';
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    const own = list.find((c) => new URL(c.url).origin === self.location.origin);
    if (own) return own.focus().then((c) => (c && 'navigate' in c ? c.navigate(url) : c));
    return self.clients.openWindow(url);
  }));
});
