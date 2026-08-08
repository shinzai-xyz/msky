const CACHE_NAME = 'misskey-analyzer-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './image/icon.png'
];

// インストール時にアセットをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// ネットワーク優先（Network First）の処理
self.addEventListener('fetch', (event) => {
  // APIリクエストはキャッシュしない
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // ネットワークからの取得が成功した場合
        // レスポンスをクローンしてキャッシュを最新状態に更新する
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      })
      .catch(() => {
        // オフラインなどでネットワーク取得が失敗した場合、キャッシュから返す
        return caches.match(event.request);
      })
  );
});
