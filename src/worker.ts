import { CommandListener } from "service-worker-command-bridge";
import { ShowNotification } from "./interfaces/notification";
import { Comlink } from "comlinkjs";
import { WorkerBridge } from "./bridge/worker-bridge";
import {
    NotificationBridge,
    NotificationBridgeInstance
} from "./bridge/notification";
import { CacheSync } from "./io/cache-sync";

declare var self: ServiceWorkerGlobalScope;

self.addEventListener("fetch", (e: FetchEvent) => {
    console.log("received fetch");
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

self.addEventListener("message", e => {
    console.log("GOT MESSAGE");
    Comlink.expose({ WorkerBridge }, e.ports[0]);
});

self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => self.clients.claim());

// CommandListener.bind("show-notification", (n: ShowNotification) => {
//     console.log("here");
//     self.registration.showNotification(n.title);
// });

// CommandListener.listen();

let sync = new CacheSync("test-cache", "./bundles/mona-ep-1/files.json");
sync.addEventListener("progress", e => {
    console.log(e.detail);
});
sync.complete.then(() => console.info("done"));
