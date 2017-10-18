import { createAudioTest } from "./ui/audio-test";
import { render } from "preact";

import { DownloadProgress } from "./io/download-progress";
import { CacheSync } from "./io/cache-sync";

declare var navigator: Navigator;

render(createAudioTest(), document.body);

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("worker.js");
}
