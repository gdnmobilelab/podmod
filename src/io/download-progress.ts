import { EventTarget } from "event-target-shim";
import { PendingPromise } from "../util/pending-promise";

interface ReadResponse {
    done: boolean;
    value: Uint8Array;
}

export interface DownloadProgressData {
    current: number;
    total: number;
}

export interface DownloadProgressEvent extends CustomEvent {
    detail: DownloadProgressData;
}

// Lets us monitor the download progress of a fetch response.
export class DownloadProgress extends EventTarget {
    reader: ReadableStreamReader;
    currentLengthDownloaded = 0;
    length = 0;

    completePromise = new PendingPromise<void>();

    get complete() {
        return this.completePromise.promise;
    }

    constructor(response: Response) {
        super();
        let lengthHeader = response.headers.get("Content-Length");
        if (!lengthHeader) {
            throw new Error("Download progress requires a Content-Length header.");
        }
        this.length = parseInt(lengthHeader, 10);
        this.reader = response.clone().body!.getReader();
        this.emitUpdate();
        this.performRead().catch(err => console.error(err));
    }

    emitUpdate() {
        let downloadEvent = new CustomEvent("progress", {
            detail: {
                current: this.currentLengthDownloaded,
                total: this.length
            } as DownloadProgressData
        });

        this.dispatchEvent(downloadEvent);
    }

    performRead() {
        return this.reader.read().then((readResponse: ReadResponse) => {
            if (readResponse.done == true) {
                return this.completePromise.fulfill();
            }
            this.currentLengthDownloaded += readResponse.value.length;

            this.emitUpdate();

            this.performRead();
        });
    }
}
