import { BASE_URL, API_VERSION } from './consts';
import { FluxerAPIError, FluxerRateLimitError } from './errors';

export interface RestOptions {
    token: string;
    baseURL?: string;
    version?: string;
    userAgent?: string;
    retries?: number;
}

export interface RequestOptions extends RequestInit {
    query?: Record<string, string | number | boolean | undefined>;
    reason?: string;
    files?: FileData[];
}

export interface FileData {
    name: string;
    file: Blob | Buffer | Uint8Array;
    filename?: string;
}

interface RateLimitBucket {
    remaining: number;
    reset: number;
    limit: number;
}

export class RestClient {
    public token: string;
    public baseURL: string;
    public version: string;
    public userAgent: string;
    public retries: number;
    private rateLimits = new Map<string, RateLimitBucket>();
    private globalRateLimit: number | null = null;

    constructor(options: RestOptions) {
        this.token = options.token;
        this.version = options.version || API_VERSION;
        this.baseURL = options.baseURL || BASE_URL;
        this.userAgent = options.userAgent || `fluxer.js/1.0.0 (Node.js ${process.version})`;
        this.retries = options.retries ?? 3;
    }

    private getBucketKey(endpoint: string, method: string): string {
        // Group endpoints by major parameter (channel/guild id)
        const match = endpoint.match(/^\/(channels|guilds|webhooks)\/(\d+)/);
        if (match) return `${method}:${match[1]}:${match[2]}`;
        return `${method}:${endpoint}`;
    }

    private async waitForRateLimit(bucketKey: string): Promise<void> {
        // Global rate limit
        if (this.globalRateLimit && Date.now() < this.globalRateLimit) {
            const delay = this.globalRateLimit - Date.now();
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Per-route rate limit
        const bucket = this.rateLimits.get(bucketKey);
        if (bucket && bucket.remaining <= 0 && Date.now() < bucket.reset) {
            const delay = bucket.reset - Date.now();
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    private updateRateLimit(bucketKey: string, headers: Headers): void {
        const remaining = headers.get('x-ratelimit-remaining');
        const reset = headers.get('x-ratelimit-reset');
        const limit = headers.get('x-ratelimit-limit');

        if (remaining !== null && reset !== null) {
            this.rateLimits.set(bucketKey, {
                remaining: parseInt(remaining),
                reset: parseFloat(reset) * 1000,
                limit: limit ? parseInt(limit) : 0,
            });
        }
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}, retryCount = 0): Promise<T> {
        const method = (options.method || 'GET').toUpperCase();
        const bucketKey = this.getBucketKey(endpoint, method);

        await this.waitForRateLimit(bucketKey);

        const url = new URL(`${this.baseURL}${endpoint}`);

        if (options.query) {
            Object.entries(options.query).forEach(([key, value]) => {
                if (value !== undefined) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        const authHeader = this.token.startsWith('Bot ') ? this.token : `Bot ${this.token}`;
        const headers: Record<string, string> = {
            'Authorization': authHeader,
            'User-Agent': this.userAgent,
            ...(options.headers as Record<string, string>),
        };

        if (options.reason) {
            headers['X-Audit-Log-Reason'] = encodeURIComponent(options.reason);
        }

        let body: any = options.body;

        // Handle file uploads
        if (options.files && options.files.length > 0) {
            const formData = new FormData();

            for (let i = 0; i < options.files.length; i++) {
                const file = options.files[i];
                const raw = file.file;
                let blob: Blob;
                if (raw instanceof Blob) {
                    blob = raw;
                } else if (Buffer.isBuffer(raw)) {
                    blob = new Blob([new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength) as any]);
                } else {
                    blob = new Blob([raw as any]);
                }
                formData.append(`files[${i}]`, blob, file.filename || file.name);
            }

            if (body && typeof body === 'object') {
                formData.append('payload_json', JSON.stringify(body));
            }

            body = formData;
            // Don't set Content-Type for FormData, let the browser/node set it with boundary
        } else if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof URLSearchParams) && !(body instanceof Blob) && !ArrayBuffer.isView(body)) {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(body);
        }

        const fetchOptions: RequestInit = {
            method,
            headers,
            body,
        };

        const response = await fetch(url.toString(), fetchOptions);

        this.updateRateLimit(bucketKey, response.headers);

        if (response.status === 429) {
            const retryAfter = response.headers.get('retry-after');
            const delay = retryAfter ? parseFloat(retryAfter) * 1000 : 5000;

            if (response.headers.get('x-ratelimit-global')) {
                this.globalRateLimit = Date.now() + delay;
            }

            if (retryCount < this.retries) {
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.request<T>(endpoint, options, retryCount + 1);
            }

            throw new FluxerRateLimitError(delay, endpoint, method);
        }

        if (!response.ok) {
            let errorBody: any;
            try {
                errorBody = await response.json();
            } catch {
                try {
                    errorBody = await response.text();
                } catch {
                    errorBody = { code: 'UNKNOWN', message: 'Unknown error' };
                }
            }

            const code = errorBody?.code || 'UNKNOWN';
            const message = errorBody?.message || `Request failed with status ${response.status}`;

            // Retry on 5xx errors
            if (response.status >= 500 && retryCount < this.retries) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                return this.request<T>(endpoint, options, retryCount + 1);
            }

            throw new FluxerAPIError(message, response.status, code, endpoint, method);
        }

        if (response.status === 204) {
            return undefined as T;
        }

        return await response.json() as T;
    }

    public async get<T = any>(endpoint: string, query?: Record<string, any>): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET', query });
    }

    public async post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'POST', body });
    }

    public async patch<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
    }

    public async put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'PUT', body });
    }

    public async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}
