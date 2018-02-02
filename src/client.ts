import { createAudioTest } from "./ui/audio-test";
import { render } from "react-dom";
import { createElement } from "react";
import { Frame } from "./ui/frame/frame";

import { DownloadProgress } from "./io/download-progress";
import { CacheSync } from "./io/cache-sync";
import { runServiceWorkerCommand } from "service-worker-command-bridge";
import { CacheSyncResponse, CacheSyncRequest } from "./interfaces/cache-sync-request";

import { main } from "./ui/frame/frame.css";

declare var navigator: Navigator;

let container = document.createElement("div");
container.className = main;
document.body.appendChild(container);

render(
    createElement(Frame, {
        scriptURL: new URL("./bundles/mona-ep-1/script.json", window.location.href).href
    }),
    container
);

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("worker.js");

    navigator.serviceWorker.onmessage = (e: ServiceWorkerMessageEvent) => {
        console.info("Received message from service worker:", e.data);
        if (e.data.command === "reload-if" && e.data.buildTime !== BUILD_TIME) {
            window.location.reload();
        }
    };
}
