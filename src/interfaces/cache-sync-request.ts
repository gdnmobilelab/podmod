export interface CacheSyncRequest {
    cacheName: string;
    payloadURL: string;
}

export interface CacheSyncResponse {
    progressEvents: MessagePort;
}
