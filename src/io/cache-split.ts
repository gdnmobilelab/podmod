interface ReadableStreamController {
    enqueue(item: ArrayBuffer);
    close();
}

class SplitResponse {
    streamController: ReadableStreamController;
    stream: ReadableStream;
    baseReader: ReadableStreamReader;
    lengthWritten: number;

    outputResponse: Response;
    chunkFinishedResponse: boolean = false;

    constructor(baseResponse: Response, baseReader: ReadableStreamReader, index: number) {
        let streamController: ReadableStreamController | undefined;
        let stream = new (ReadableStream as any)({
            start: controller => {
                streamController = controller;
            },
            pull() {},
            cancel() {}
        });

        if (!streamController) {
            throw new Error("Stream Controller was not created");
        }

        this.streamController = streamController;

        let customHeaders: Headers | undefined;
        if (index === 0) {
            customHeaders = new Headers(index === 0 ? baseResponse.headers : []);
            customHeaders.set("Split-File", "true");
        }

        this.outputResponse = new Response(stream, { headers: customHeaders, status: baseResponse.status });

        this.baseReader = baseReader;
        this.lengthWritten = 0;
    }

    async pipe() {
        while (this.lengthWritten < CHUNK_SIZE) {
            let result = (await this.baseReader.read()) as { done: boolean; value?: ArrayBuffer };
            if (result.done === true) {
                console.info(`SPLIT: Final chunk finished at ${this.lengthWritten} bytes`);
                this.streamController.close();
                this.chunkFinishedResponse = true;
                return;
            } else if (!result.value) {
                throw new Error("Stream is not done but has no value?");
            }
            this.streamController.enqueue(result.value);
            this.lengthWritten += result.value.byteLength;
        }
        console.info(`SPLIT: Successfully wrote ${this.lengthWritten} bytes`);
        this.streamController.close();
    }
}

const CHUNK_SIZE = 1024 * 10000;

export async function splitAndPut(response: Response, targetCache: Cache) {
    let length = Number(response.headers.get("content-length"));

    if (!length || isNaN(length)) {
        throw new Error("Missing or malformed Content-Length header in response");
    }

    if (!response.body) {
        throw new Error("Response has no body?");
    }

    if (length < CHUNK_SIZE) {
        // If it's under 10MB then we're fine to just put it normally
        return targetCache.put(response.url, response);
    }

    let totalPieces = Math.ceil(length / CHUNK_SIZE);
    console.info(`SPLIT: found response with length of ${length}, splitting into ${totalPieces} chunks`);
    let reader = await response.body.getReader();

    let splitIndex = 0;

    let split = new SplitResponse(response, reader, splitIndex);
    split.pipe();
    await targetCache.put(response.url, split.outputResponse);

    while (split.chunkFinishedResponse === false) {
        splitIndex++;
        split = new SplitResponse(response, reader, splitIndex);
        split.pipe();
        await targetCache.put(`__multi_${splitIndex}_${response.url}`, split.outputResponse);
    }
}

export async function deleteExisting(request: Request, cache: Cache) {
    let originalURL = request.url;
    let requestToMatch = request;
    let match: Response | undefined = await cache.match(requestToMatch);
    if (!match) {
        return;
    }

    let index = 0;
    while (match) {
        console.info("SPLIT: Deleting existing cached asset", requestToMatch.url);
        await cache.delete(requestToMatch.url);
        index++;
        requestToMatch = new Request(`__multi_${index}_${originalURL}`);
        match = await cache.match(requestToMatch);
    }
}

export async function cacheCheckSplit(request: Request): Promise<Response | undefined> {
    let match: Response | undefined = await caches.match(request);
    if (!match) {
        return match;
    }
    let splitFile = match.headers.get("split-file");
    if (!splitFile) {
        // is not a split file
        return match;
    }
    console.log(`SPLIT: ${request.url} is a split cached file`);

    let streamController: ReadableStreamController | undefined;
    let stream = new (ReadableStream as any)({
        start: controller => {
            streamController = controller;
        },
        pull() {},
        cancel() {}
    });

    if (!streamController) {
        throw new Error("Stream controller was not created");
    }

    let customHeaders = new Headers(match.headers);

    customHeaders.delete("split-file");

    let response = new Response(stream, {
        headers: customHeaders,
        status: match.status
    });

    (async function() {
        let index = 0;
        let inputReader: ReadableStreamReader | undefined = match.body!.getReader();
        console.info("SPLIT: Beginning stream of split asset");
        while (inputReader) {
            let result = (await inputReader.read()) as { done: boolean; value?: ArrayBuffer };
            if (result.done === false) {
                streamController.enqueue(result.value!);
            } else {
                inputReader = undefined;
                index++;
                let nextResponse = await caches.match(`__multi_${index}_${request.url}`);
                if (!nextResponse) {
                    console.info("SPLIT: Completed stream of split file");
                    streamController.close();
                } else {
                    console.info("SPLIT: Streaming next segment", nextResponse.url);
                    inputReader = await nextResponse.body!.getReader();
                }
            }
        }
    })();

    return response;
}
