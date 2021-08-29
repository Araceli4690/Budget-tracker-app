const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;
//files to cache
const FILES_TO_CACHE = [
    "/index.html",
    "/manifest.json",
    "/css/styles.css",
    "/js/index.js",
    "icons/icon-72x72.png",
    "icons/icon-96x96.png",
    "icons/icon-128x128.png",
    "icons/icon-144x144.png",
    "icons/icon-152x152.png",
    "icons/icon-192x192.png",
    "icons/icon-384x384.png",
    "icons/icon-512x512.png"
]

//install service worker
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache: ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

//telling service worker how to manage caches
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeepList = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeepList.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function (key, i) {
                    if (cacheKeepList.indexOf(key) === -1) {
                        console.log('deleting cache: ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            )
        })
    )
})


//telling app how to retrieve info from cache
self.addEventListener('fetch', function (e) {
    console.log('fetch request: ' + e.request.url)
    e.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) {
                console.log('responding with cache: ' + e.request.url)
                return request
            } else {
                console.log('file is not caches, fetching: ' + e.request.url)
                return fetch(e.request)
            }
        })
    )
})