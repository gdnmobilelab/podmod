import { ShowNotification } from "./interfaces/notification";
// import { WorkerBridge } from "./bridge/worker-bridge";
import { NotificationBridge, NotificationBridgeInstance } from "./bridge/notification";
import { CacheSync } from "./io/cache-sync";
import { CommandListener } from "service-worker-command-bridge";
// import * as deepEqual from "deep-equal";
import { CacheSyncRequest, CacheSyncResponse } from "./interfaces/cache-sync-request";
import {
    setConfig,
    subscribeToTopic,
    unsubscribeFromTopic,
    getSubscribedTopics,
    SubscribeOptions,
    UnsubscribeOptions
} from "pushkin-client";

declare var self: ServiceWorkerGlobalScope;

async function checkCache() {
    let hasCache = await caches.has("podmod-shell");

    if (hasCache) {
        console.info("Removing existing cache of podcast shell.");
        await caches.delete("podmod-shell");
    }

    // cache the files we need to serve this page offline
    if (ENVIRONMENT !== "production") {
        console.warn("Not caching worker assets because we are in dev mode");
    } else {
        console.info("Adding cache of podcast shell.");
        let newCache = await caches.open("podmod-shell");
        try {
            await newCache.addAll(["styles.css", "./", "client.js"]);
        } catch (err) {
            console.error("Failed to cache!", err);
        }
    }
}

async function clientClaim() {
    await self.clients.claim();
    let clients = await self.clients.matchAll();

    clients.forEach(c =>
        c.postMessage({
            command: "reload-if",
            buildTime: BUILD_TIME
        })
    );
}

self.addEventListener("install", e => {
    e.waitUntil(Promise.all([checkCache(), self.skipWaiting()]));
});

self.addEventListener("activate", e => {
    e.waitUntil(clientClaim());
});

self.addEventListener("fetch", (e: FetchEvent) => {
    e.respondWith(
        (async function() {
            let cachedVersion = await caches.match(e.request);
            if (cachedVersion) {
                return cachedVersion;
            }

            let inProgressVersion = await CacheSync.matchInProgress(e.request);

            if (inProgressVersion) {
                return inProgressVersion;
            }
            console.info("Going over the wire to fetch", e.request.url);
            return fetch(e.request);
        })()
    );
});

// CommandListener.bind("cachesync", (request: CacheSyncRequest) => {
//     let sync = new CacheSync(request.cacheName, request.payloadURL);
//     let channel = new MessageChannel();

//     sync.addEventListener("progress", e => {
//         channel.port1.postMessage(
//             Object.assign(e.detail, {
//                 type: "progress"
//             })
//         );
//     });
//     return {
//         progressEvents: channel.port2
//     } as CacheSyncResponse;
// });

CommandListener.listen();

// self.addEventListener("message", e => {
//     console.log("GOT MESSAGE");
// });

CommandListener.bind("show-notification", (n: ShowNotification) => {
    console.log("SHOW THIS?", n);
    self.registration.showNotification(n.title, {
        icon: n.icon,
        body: n.body,
        data: n.data,
        badge: n.badge,
        actions: n.actions,
        image: n.image
    } as any);
});

CommandListener.bind("get-notifications", async (n: ShowNotification) => {
    let notifications = await self.registration.getNotifications();
    return notifications.map(n => {
        return {
            title: n.title,
            body: n.body,
            icon: n.icon,
            data: (n as any).data
        } as ShowNotification;
    });
});

CommandListener.bind("remove-notification", async (predicate: any) => {
    let notifications = (await self.registration.getNotifications()) as Notification[];
    notifications.forEach(notification => {
        for (let key in predicate) {
            if (predicate[key] !== (notification as any).data[key]) {
                return;
            }
        }
        notification.close();
    });
});

async function focusWindowIfExists() {
    let allClients = await self.clients.matchAll();
    if (allClients.length === 0) {
        console.warn("Tried to focus browser window but there was none");
        return;
    }
    (allClients[0] as WindowClient).focus();
}

self.addEventListener("notificationclick", e => {
    console.log("NOTIFY HIT");
    e.notification.close();

    if (e.action === "open-link") {
        self.clients.openWindow((e.notification as any).data.link_url);
        return;
    }

    e.waitUntil(focusWindowIfExists());
});

setConfig({
    key: PUSHKIN_KEY,
    host: PUSHKIN_HOST
});

CommandListener.bind("get-subscribed-topics", getSubscribedTopics);
CommandListener.bind("push-subscribe", (opts: SubscribeOptions) => {
    return subscribeToTopic(opts);
});

CommandListener.bind("push-unsubscribe", (opts: UnsubscribeOptions) => {
    return unsubscribeFromTopic(opts);
});
