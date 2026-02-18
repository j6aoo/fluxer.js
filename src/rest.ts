import { BASE_URL, API_VERSION } from './consts';
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
    name: string;
    file: Blob | Buffer | Uint8Array;
    filename?: string;
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
        this.baseURL = options.baseURL || BASE_URL;
        this.userAgent = options.userAgent || `fluxer.js/1.0.0 (Node.js ${process.version})`;
        this.retries = options.retries ?? 3;
        this.rateLimitManager = new RateLimitManager(this);
    }

    /** Get the token */
    public getToken(): string {
        return this.token;
    }

    public async makeRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<InternalResponse<T>> {
        const method = (options.method || 'GET').toUpperCase();
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

        if (!response.ok && response.status !== 429) {
            const code = data?.code || 'UNKNOWN';
            const message = data?.message || `Request failed with status ${response.status}`;
            throw new FluxerAPIError(message, response.status, code, endpoint, method);
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
