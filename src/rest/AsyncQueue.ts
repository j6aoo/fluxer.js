export class AsyncQueue {
    private promises: { resolve: () => void; promise: Promise<void> }[] = [];

    public get remaining(): number {
        return this.promises.length;
    }

    public wait(): Promise<void> {
        const promise = this.promises.length > 0
            ? this.promises[this.promises.length - 1].promise.then(() => {})
            : Promise.resolve();

        let resolve!: () => void;
        const nextPromise = new Promise<void>(res => {
            resolve = res;
        });

        this.promises.push({ resolve, promise: nextPromise });
        return promise;
    }

    public shift(): void {
        const deferred = this.promises.shift();
        if (deferred) {
            deferred.resolve();
        }
    }
}
