import { SequentialHandler } from './SequentialHandler';

export class RateLimitManager {
    public handlers = new Map<string, SequentialHandler>();
    public globalRemaining: number = 50; // Example default
    public globalReset: number = -1;

    constructor(private rest: any) {}

    public getHandler(endpoint: string, method: string): SequentialHandler {
        const bucket = this.getBucketKey(endpoint, method);
        let handler = this.handlers.get(bucket);

        if (!handler) {
            handler = new SequentialHandler(this.rest, bucket);
            this.handlers.set(bucket, handler);
        }

        return handler;
    }

    private getBucketKey(endpoint: string, method: string): string {
        const match = endpoint.match(/^\/(channels|guilds|webhooks)\/(\d+)/);
        if (match) return `${method}:${match[1]}:${match[2]}`;
        return `${method}:${endpoint}`;
    }
}
