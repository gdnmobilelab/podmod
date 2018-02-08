// import { ShowNotification } from "./interfaces/notification";
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

import { fireCommand, ShowNotification, RunCommand, setup, registerCommand } from "worker-commands";

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
    if (ENVIRONMENT !== "production") {
        return;
    }
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
setup();

// self.addEventListener("message", e => {
//     console.log("GOT MESSAGE");
// });

CommandListener.bind("fire-worker-command", (c: RunCommand<any>) => {
    return fireCommand(c);
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

interface ShowPhotoRequest {
    url: string;
}

registerCommand("podmod.openphoto", async (opts: ShowPhotoRequest) => {
    let clients = await self.clients.matchAll();

    clients.forEach(c =>
        c.postMessage({
            command: "podmod.openphoto",
            url: opts.url
        })
    );
});

registerCommand("podmod.closephoto", async () => {
    let clients = await self.clients.matchAll();

    clients.forEach(c =>
        c.postMessage({
            command: "podmod.closephoto"
        })
    );
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
