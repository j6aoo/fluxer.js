import { AsyncQueue } from './AsyncQueue';
import type { RestClient, RequestOptions } from '../rest';

export interface RateLimitData {
    limit: number;
    remaining: number;
    reset: number;
    after: number;
    bucket: string;
}

export class SequentialHandler {
    private queue = new AsyncQueue();
    private remaining: number = 1;
    private reset: number = -1;
    private limit: number = -1;

    constructor(private manager: any, private bucket: string) {}

    public async push<T>(endpoint: string, options: RequestOptions): Promise<T> {
        await this.queue.wait();
        try {
            return await this.execute<T>(endpoint, options);
        } finally {
            this.queue.shift();
        }
    }

    private async execute<T>(endpoint: string, options: RequestOptions, retryCount = 0): Promise<T> {
        // Global rate limit check
        while (this.manager.rateLimitManager.globalRemaining <= 0 && Date.now() < this.manager.rateLimitManager.globalReset) {
            const delay = this.manager.rateLimitManager.globalReset - Date.now();
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Local rate limit check
        if (this.remaining <= 0 && Date.now() < this.reset) {
            const delay = this.reset - Date.now();
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const response = (await this.manager.makeRequest(endpoint, options)) as any;

        if (response.headers) {
            this.updateRateLimits(response.headers);
        }

        // Handle rate limit (429)
        if (response.status === 429) {
            const retryAfter = response.headers.get('retry-after') || response.headers.get('Retry-After');
            const delay = retryAfter ? parseFloat(retryAfter) * 1000 : 5000;
            const isGlobal = response.headers.get('x-ratelimit-global') === 'true';

            if (isGlobal) {
                this.manager.rateLimitManager.globalReset = Date.now() + delay;
                this.manager.rateLimitManager.globalRemaining = 0;
            }

            this.manager.emit('rateLimited', {
                limit: this.limit,
                remaining: this.remaining,
                reset: this.reset,
                after: delay,
                bucket: this.bucket
            });

            if (retryCount < (this.manager.retries || 3)) {
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.execute<T>(endpoint, options, retryCount + 1);
            }

            // Max retries reached, throw error
            const { FluxerRateLimitError } = require('../errors');
            throw new FluxerRateLimitError(delay, endpoint, options.method || 'GET', response.headers);
        }

        return response.data;
    }

    private updateRateLimits(headers: Headers): void {
        const limit = headers.get('x-ratelimit-limit');
        const remaining = headers.get('x-ratelimit-remaining');
        const reset = headers.get('x-ratelimit-reset');

        if (limit) this.limit = parseInt(limit);
        if (remaining) this.remaining = parseInt(remaining);
        if (reset) this.reset = parseFloat(reset) * 1000;
    }
}
