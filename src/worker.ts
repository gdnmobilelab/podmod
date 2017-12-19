import { ShowNotification } from "./interfaces/notification";
// import { WorkerBridge } from "./bridge/worker-bridge";
import { NotificationBridge, NotificationBridgeInstance } from "./bridge/notification";
import { CacheSync } from "./io/cache-sync";
import { CommandListener } from "service-worker-command-bridge";
// import * as deepEqual from "deep-equal";
import { CacheSyncRequest, CacheSyncResponse } from "./interfaces/cache-sync-request";

declare var self: ServiceWorkerGlobalScope;

self.addEventListener("fetch", (e: FetchEvent) => {
    e.respondWith(
        caches
            .match(e.request)
            .then(response => {
                console.log("cache response", response);
                return response || CacheSync.matchInProgress(e.request);
            })
            .then(response => {
                return response || fetch(e.request);
            })
    );
});

CommandListener.bind("cachesync", (request: CacheSyncRequest) => {
    let sync = new CacheSync(request.cacheName, request.payloadURL);
    let channel = new MessageChannel();

    sync.addEventListener("progress", e => {
        channel.port1.postMessage(
            Object.assign(e.detail, {
                type: "progress"
            })
        );
    });
    return {
        progressEvents: channel.port2
    } as CacheSyncResponse;
});

CommandListener.listen();

// self.addEventListener("message", e => {
//     console.log("GOT MESSAGE");
// });

self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => self.clients.claim());

CommandListener.bind("show-notification", (n: ShowNotification) => {
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

self.addEventListener("notificationclick", async e => {
    e.notification.close();

    if (e.action === "open-link") {
        self.clients.openWindow((e.notification as any).data.link_url);
        return;
    }

    let allClients = await self.clients.matchAll();
    (allClients[0] as WindowClient).focus();
});

// CommandListener.bind("remove-notification")

// CommandListener.listen();

// let sync = new CacheSync("test-cache", "./bundles/mona-ep-1/files.json");
// sync.addEventListener("progress", e => {
//     console.log(e.detail);
// });
// sync.complete.then(() => console.info("done"));
