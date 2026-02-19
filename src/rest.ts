import { API_VERSION } from './consts';
import { FluxerAPIError, FluxerRateLimitError } from './errors';
import { RateLimitManager } from './rest/RateLimitManager';
import { EventEmitter } from 'node:events';

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
    /** The file blob/buffer data */
    file: Blob | Buffer | Uint8Array;
    /** The filename to use for this file */
    filename: string;
    /** Optional description for the attachment */
    description?: string;
}

export interface InternalResponse<T> {
    data: T;
    status: number;
    headers: Headers;
    ok: boolean;
}

export class RestClient extends EventEmitter {
    private readonly token: string;
    public baseURL: string;
    public version: string;
    public userAgent: string;
    public retries: number;
    public rateLimitManager: RateLimitManager;

    constructor(options: RestOptions) {
        super();
        this.token = options.token;
        this.version = options.version || API_VERSION;
        this.baseURL = options.baseURL || 'https://api.fluxer.app/v1';
        // User-Agent format: ApplicationName (URL, Version)
        this.userAgent = options.userAgent || `fluxer.js (https://github.com/fluxerapp/fluxer.js, 1.0.0)`;
        this.retries = options.retries ?? 3;
        this.rateLimitManager = new RateLimitManager(this);
    }

    /** Get the token */
    public getToken(): string {
        return this.token;
    }

    /** Build the full API URL with version prefix */
    private buildURL(endpoint: string): URL {
        const base = this.baseURL.replace(/\/$/, '');
        const baseHasVersion = base.endsWith(`/${this.version}`);
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const versionedEndpoint = baseHasVersion
            ? normalizedEndpoint
            : endpoint.startsWith(`/${this.version}/`)
                ? endpoint
                : `/${this.version}${normalizedEndpoint}`;
        return new URL(`${base}${versionedEndpoint}`);
    }

    public async makeRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<InternalResponse<T>> {
        const method = (options.method || 'GET').toUpperCase();
        const url = this.buildURL(endpoint);
        const FormDataCtor = globalThis.FormData || require('form-data');

        if (options.query) {
            Object.entries(options.query).forEach(([key, value]) => {
                if (value !== undefined) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        // Support both Bot tokens (for bots) and Bearer tokens (for user/OAuth2)
        let authHeader: string;
        if (this.token.startsWith('Bot ') || this.token.startsWith('Bearer ')) {
            authHeader = this.token;
        } else {
            // Default to Bot token for backwards compatibility
            authHeader = `Bot ${this.token}`;
        }
        const headers = new Headers(options.headers as any);
        headers.set('Authorization', authHeader);
        headers.set('User-Agent', this.userAgent);

        if (options.reason) {
            headers.set('X-Audit-Log-Reason', encodeURIComponent(options.reason));
        }

        let body: any = options.body;

        if (options.files && options.files.length > 0) {
            const formData = new FormDataCtor();

            // Build attachments metadata array for payload_json
            const attachments = options.files.map((file, index) => ({
                id: index,
                filename: file.filename,
                description: file.description,
            }));

            const fileBlobs = await Promise.all(options.files.map(async (file, index) => {
                const raw = file.file;
                const isBuffer = typeof Buffer !== 'undefined' && Buffer.isBuffer(raw);
                let blob: Blob;
                if (raw instanceof Blob) {
                    blob = raw;
                } else if (isBuffer) {
                    blob = new Blob([new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength) as any]);
                } else {
                    blob = new Blob([raw as any]);
                }
                return { index, file, blob };
            }));

            for (const { index, file, blob } of fileBlobs) {
                formData.append(`files[${index}]`, blob, file.filename);
            }

            // Merge attachments into payload body if body exists
            if (body && typeof body === 'object') {
                body = { ...body, attachments };
            } else {
                body = { attachments };
            }

            if (body && typeof body === 'object') {
                formData.append('payload_json', JSON.stringify(body));
            }

            body = formData;
        } else if (body && typeof body === 'object' && !(body instanceof FormDataCtor) && !(body instanceof URLSearchParams) && !(body instanceof Blob) && !ArrayBuffer.isView(body)) {
            headers.set('Content-Type', 'application/json');
            body = JSON.stringify(body);
        }

        const fetchOptions: RequestInit = {
            method,
            headers,
            body,
        };

        const response = await fetch(url.toString(), fetchOptions);

        const globalHeader = response.headers.get('x-ratelimit-global') || response.headers.get('X-RateLimit-Global');
        if (globalHeader) {
            const globalRemaining = Number(globalHeader);
            if (Number.isFinite(globalRemaining)) {
                this.rateLimitManager.globalRemaining = globalRemaining;
            } else if (globalHeader.toLowerCase() === 'true') {
                this.rateLimitManager.globalRemaining = 0;
            }

            const globalReset = response.headers.get('x-ratelimit-reset') || response.headers.get('X-RateLimit-Reset');
            if (globalReset) {
                this.rateLimitManager.globalReset = parseFloat(globalReset) * 1000;
            }
        }

        let data: any;
        if (response.status !== 204) {
            try {
                data = await response.json();
            } catch {
                try {
                    data = await response.text();
                } catch {
                    data = null;
                }
            }
        }

        // Handle rate limiting - Don't throw here, let SequentialHandler handle retry
        // The 429 response will be returned and handled by the rate limit manager
        if (response.status === 429) {
            return {
                data,
                status: response.status,
                headers: response.headers,
                ok: false
            };
        }

        // Handle API errors
        if (!response.ok) {
            // API returns error code as string (e.g., "UNKNOWN_USER", "INVALID_FORM_BODY")
            const code = data?.code || 'UNKNOWN_ERROR';
            const message = data?.message || `Request failed with status ${response.status}`;
            const error = new FluxerAPIError(message, response.status, code, endpoint, method);
            
            // Attach validation errors if present (INVALID_FORM_BODY)
            if (data?.errors && Array.isArray(data.errors)) {
                (error as any).errors = data.errors;
            }
            
            throw error;
        }

        return {
            data,
            status: response.status,
            headers: response.headers,
            ok: response.ok
        };
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const method = (options.method || 'GET').toUpperCase();
        const handler = this.rateLimitManager.getHandler(endpoint, method);
        return handler.push<T>(endpoint, options);
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
