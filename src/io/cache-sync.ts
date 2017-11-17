import { PendingPromise } from "../util/pending-promise";
import { DownloadProgress, DownloadProgressEvent, DownloadProgressData } from "./download-progress";
import * as parseRange from "range-parser";
import { EventTarget } from "event-target-shim";

interface FileDetails {
    url: string;
    downloaded: number;
    total: number;
}

export class CacheSync extends EventTarget {
    completePromise = new PendingPromise<void>();
    files: FileDetails[];

    get complete() {
        return this.completePromise.promise;
    }

    private static currentlyDownloadingResponses = new Map<Response, number>();

    static matchInProgress(request: Request) {
        // While cache.put() is being run, the entry itself isn't actually
        // in the

        let existing = Array.from(this.currentlyDownloadingResponses.keys()).find(
            response => response.url == request.url
        );

        if (existing) {
            let rangeHeader = request.headers.get("range");
            if (!rangeHeader) {
                return existing.clone();
            }

            let length = existing.headers.get("content-length");
            let requestedRange = parseRange(length, rangeHeader);
            let currentlyDownloaded = this.currentlyDownloadingResponses.get(existing);
            // Only supporting the first range requested, that's all <audio/> ever does

            if (!currentlyDownloaded || requestedRange[0].start > currentlyDownloaded) {
                // A range has been requested that's outside of what we have
                // cached so far. So we send the user over the wire instead, which isn't
                // ideal but it'll have to do.

                return undefined;
            }

            return existing.clone();
        }
        return undefined;
    }

    constructor(cacheName: string, payloadURL: string) {
        super();

        let payload = new URL(payloadURL, self.location.href);

        Promise.all([
            caches.open(cacheName),
            fetch(payloadURL).then(res => {
                // Payload files are always arrays of strings, so we can make this
                // promise more specific than it would have been otherwise.

                return res.json() as Promise<string[]>;
            })
        ])
            .then(([cache, fileList]) => {
                this.files = fileList.map(file => {
                    return {
                        url: new URL(file, payload.href).href,
                        downloaded: 0,
                        total: -1
                    };
                });

                let promises = this.files.map(file => this.performCacheCheck(cache, file));
                return Promise.all(promises);
            })
            .then(() => {
                this.completePromise.fulfill();
            })
            .catch(err => {
                console.error(err);
                this.completePromise.reject(err);
            });
    }

    performCacheCheck(cache: Cache, fileEntry: FileDetails) {
        return cache.match(fileEntry.url).then((existingMatch: Response | undefined) => {
            let checkRequest = new Request(fileEntry.url);

            // If we already have an entry in the cache, adjust our request
            // so we can get a 304 response if that applies.

            if (existingMatch) {
                let etag = existingMatch.headers.get("etag");
                let lastModified = existingMatch.headers.get("last-modified");

                if (etag) {
                    checkRequest.headers.append("If-None-Match", etag);
                }

                if (lastModified) {
                    checkRequest.headers.append("If-Modified-Since", lastModified);
                }
            }

            return fetch(checkRequest).then(res => {
                if (res.status == 304) {
                    // The file hasn't changed since the last time we downloaded it
                    // so we'll just set our progress based on the previously cached
                    // version.

                    if (!existingMatch) {
                        throw new Error("Should never get 304 response when we have no existing match!");
                    }

                    // We know we have this header because it would have thrown an error
                    // on initial download otherwise.

                    let length = parseInt(existingMatch.headers.get("content-length")!, 10);
                    console.info(`${fileEntry.url} is already in the cache.`);
                    fileEntry.total = length;
                    fileEntry.downloaded = length;
                    this.emitProgressUpdate();
                } else {
                    // Add to the downloading array, so fetch events can use it

                    return this.cacheDownload(cache, fileEntry, res);
                }
            });
        });
    }

    cacheDownload(targetCache: Cache, fileEntry: FileDetails, incomingResponse: Response) {
        let cloneForResponse = incomingResponse.clone();
        CacheSync.currentlyDownloadingResponses.set(cloneForResponse, 0);

        let progress = new DownloadProgress(incomingResponse);

        progress.addEventListener("progress", (e: DownloadProgressEvent) => {
            fileEntry.downloaded = e.detail.current;

            // Update our 'currently downloading' collection to reflect the new downloaded
            // length.

            CacheSync.currentlyDownloadingResponses.set(cloneForResponse, e.detail.current);
            this.emitProgressUpdate();
        });

        fileEntry.total = progress.length;
        this.emitProgressUpdate();

        console.info(`Putting ${fileEntry.url} into the cache.`);

        return Promise.all([
            targetCache.put(incomingResponse.url, incomingResponse),
            progress.complete
        ]).then(() => {
            // Now that the response is successfully inserted into the cache, we don't
            // need our temporary store any more.
            CacheSync.currentlyDownloadingResponses.delete(cloneForResponse);
            console.info(`Successfully put ${fileEntry.url} into the cache.`);
        });
    }

    emitProgressUpdate() {
        let allFilesTotal = this.files.reduce((previous, current, index) => {
            if (previous == -1 || current.total == -1) {
                // If any of the files don't have totals yet, we
                // return -1 for the total, because we don't know what
                // it is.

                return -1;
            }
            return previous + current.total;
        }, 0);

        let downloadedTotal = this.files.reduce((previous, current) => {
            return previous + current.downloaded;
        }, 0);

        let event = new CustomEvent("progress", {
            detail: {
                current: downloadedTotal,
                total: allFilesTotal
            } as DownloadProgressData
        });

        this.dispatchEvent(event);
    }
}
