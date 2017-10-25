import { createAudioTest } from "./ui/audio-test";
import { render, h } from "preact";
import { Frame } from "./ui/frame/frame";

import { DownloadProgress } from "./io/download-progress";
import { CacheSync } from "./io/cache-sync";
import { runServiceWorkerCommand } from "service-worker-command-bridge";
import { CacheSyncResponse, CacheSyncRequest } from "./interfaces/cache-sync-request";
declare var navigator: Navigator;

render(h(Frame, {}), document.body);

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("worker.js");
}
