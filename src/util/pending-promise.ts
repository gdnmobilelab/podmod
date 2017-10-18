export class PendingPromise<T> {
    fulfill: (val?: T) => void;
    reject: (Error) => void;
    promise: Promise<T>;

    constructor() {
        this.promise = new Promise<T>((f, r) => {
            this.fulfill = f;
            this.reject = r;
        });
    }
}
