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
import { cacheCheckSplit } from "./io/cache-split";
import checkForRangeRequest from "browser-range-response";
import { sendEvent } from "./util/analytics";

// import checkForRangeRequest from "browser-range-response";

import {
    fireCommand,
    ShowNotification,
    RunCommand,
    setup,
    registerCommand,
    addListener
} from "worker-commands";

declare var self: ServiceWorkerGlobalScope;

async function checkCache() {
    return console.warn("Disabled all caching for launch");
    // let hasCache = await caches.has("podmod-shell");

    // if (hasCache) {
    //     console.info("Removing existing cache of podcast shell.");
    //     await caches.delete("podmod-shell");
    // }

    // // cache the files we need to serve this page offline
    // if (process.env.NODE_ENV !== "production") {
    //     console.warn("Not caching worker assets because we are in dev mode");
    // } else {
    //     console.info("Adding cache of podcast shell.");
    //     let newCache = await caches.open("podmod-shell");
    //     try {
    //         await newCache.addAll(["styles.css", "./", "client.js"]);
    //     } catch (err) {
    //         console.error("Failed to cache!", err);
    //     }
    // }
}

async function clientClaim() {
    await self.clients.claim();
    let clients = await self.clients.matchAll();
    if (process.env.NODE_ENV !== "production") {
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

// self.addEventListener("fetch", (e: FetchEvent) => {
//     e.respondWith(
//         (async function() {
//             let bypassCache = e.request.headers.get("bypass-cache");

//             if (bypassCache) {
//                 console.info("Specifically bypassing cache for", e.request.url);
//                 return fetch(e.request);
//             }

//             let searchFor: Request = e.request;

//             // if (e.request.url.indexOf("dummyQuery=") > -1) {
//             //     console.log("AMENDING QUERY");
//             //     let editableURL = new URL(e.request.url);
//             //     editableURL.searchParams.delete("dummyQuery");
//             //     searchFor = new Request(editableURL.href);
//             // }

//             let cachedVersion: Response | undefined = await cacheCheckSplit(searchFor);

//             if (cachedVersion) {
//                 cachedVersion = await checkForRangeRequest(e.request, cachedVersion);
//             }

//             if (cachedVersion) {
//                 return cachedVersion;
//             }

//             console.info("Going over the wire to fetch", e.request.url, e.request.headers.get("range"));
//             return fetch(e.request);
//         })()
//     );
// });

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

addListener("notification.show", opts => {
    sendEvent("Notification", "Shows", opts.body);
});
addListener("notification.process-click", (opts, e) => {
    if (!e) {
        throw new Error("No notification event?");
    }
    if (e && e.action) {
        sendEvent("Notification", e.action + " CTA", e.notification.body);
    } else {
        sendEvent("Notification", "Taps", e.notification.body);
    }
});

setConfig({
    key: PUSHKIN_KEY,
    host: PUSHKIN_HOST
});

CommandListener.bind("get-subscribed-topics", () => {
    console.info("WORKER: getting subscribed topics from pushkin");
    return getSubscribedTopics()
        .then(topics => {
            console.log("got topics!", topics);
            return topics;
        })
        .catch(err => {
            console.error(err);
            throw err;
        });
});
CommandListener.bind("push-subscribe", (opts: SubscribeOptions) => {
    return subscribeToTopic(opts);
});

CommandListener.bind("push-unsubscribe", (opts: UnsubscribeOptions) => {
    return unsubscribeFromTopic(opts);
});
