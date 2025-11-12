// Service Worker for Home Liberation Winnipeg PWA
// Version 1.0.0

const CACHE_NAME = 'home-liberation-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/contact.html',
    '/buyers.html',
    '/about.html',
    '/services.html',
    '/faq.html',
    '/admin-login.html',
    '/manifest.json',
    '/offline.html',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];

// Install event - cache assets
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip chrome extensions and external requests
    if (!event.request.url.startsWith(self.location.origin) &&
        !event.request.url.startsWith('https://fonts.googleapis.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached response if found
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Otherwise fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache the fetched response
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // If offline and not cached, show offline page
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                    });
            })
    );
});

// Background sync for form submissions
self.addEventListener('sync', event => {
    console.log('[Service Worker] Background sync:', event.tag);

    if (event.tag === 'sync-leads') {
        event.waitUntil(syncLeads());
    }

    if (event.tag === 'sync-buyers') {
        event.waitUntil(syncBuyers());
    }
});

// Sync seller leads
async function syncLeads() {
    const syncData = await getStoredData('pending-leads');

    for (const lead of syncData) {
        try {
            const response = await fetch('http://localhost:5678/webhook/property-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lead)
            });

            if (response.ok) {
                await removeStoredData('pending-leads', lead.id);
                console.log('[Service Worker] Lead synced:', lead.id);
            }
        } catch (error) {
            console.error('[Service Worker] Sync failed for lead:', lead.id, error);
        }
    }
}

// Sync buyer subscriptions
async function syncBuyers() {
    const syncData = await getStoredData('pending-buyers');

    for (const buyer of syncData) {
        try {
            const response = await fetch('http://localhost:5678/webhook/buyer-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(buyer)
            });

            if (response.ok) {
                await removeStoredData('pending-buyers', buyer.id);
                console.log('[Service Worker] Buyer synced:', buyer.id);
            }
        } catch (error) {
            console.error('[Service Worker] Sync failed for buyer:', buyer.id, error);
        }
    }
}

// Helper functions for IndexedDB
async function getStoredData(storeName) {
    // In production, use IndexedDB
    // Simplified for demonstration
    return [];
}

async function removeStoredData(storeName, id) {
    // In production, remove from IndexedDB
    console.log('[Service Worker] Removing stored data:', storeName, id);
}

// Push notifications
self.addEventListener('push', event => {
    console.log('[Service Worker] Push notification received');

    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body || 'New notification from Home Liberation',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/',
            timestamp: Date.now()
        },
        actions: [
            {
                action: 'open',
                title: 'View',
                icon: '/icons/view-icon.png'
            },
            {
                action: 'close',
                title: 'Dismiss',
                icon: '/icons/close-icon.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Home Liberation', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    console.log('[Service Worker] Notification clicked');

    event.notification.close();

    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url || '/')
        );
    }
});

// Message handler
self.addEventListener('message', event => {
    console.log('[Service Worker] Message received:', event.data);

    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            })
        );
    }
});

console.log('[Service Worker] Loaded successfully');
