import { render } from "react-dom";
import { createElement } from "react";
import { Frame } from "./ui/frame/frame";

import { DownloadProgress } from "./io/download-progress";
import { CacheSync } from "./io/cache-sync";
import { runServiceWorkerCommand } from "service-worker-command-bridge";
import { CacheSyncResponse, CacheSyncRequest } from "./interfaces/cache-sync-request";
import { sendPageView } from "./util/analytics";

import { main } from "./ui/frame/frame.css";

declare var navigator: Navigator;

let container = document.createElement("div");
container.className = main;
document.body.appendChild(container);

render(
    createElement(Frame, {
        scriptURL: new URL(SCRIPT_URL, window.location.href).href
    }),
    container
);

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("worker.js");

    navigator.serviceWorker.onmessage = (e: ServiceWorkerMessageEvent) => {
        console.info("Received message from service worker:", e.data);
        if (e.data.command === "reload-if" && e.data.buildTime !== BUILD_TIME) {
            let currentLocation = new URL(window.location.href);
            if (currentLocation.searchParams.get("reloaded")) {
                // We've already reloaded. To avoid a loop, don't do anything more
                return;
            }

            currentLocation.searchParams.set("reloaded", "1");

            window.location.href = currentLocation.href;
        }
    };
}
console.log("send pageview");
sendPageView(window.location.href, document.title);
