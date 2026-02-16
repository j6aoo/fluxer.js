import { BASE_URL, API_VERSION } from './consts';

export interface RestOptions {
    token: string;
    baseURL?: string;
    version?: string;
    userAgent?: string;
}

export interface RequestOptions extends RequestInit {
    query?: Record<string, string | number | boolean | undefined>;
    files?: { name: string; file: Blob | Buffer | Uint8Array; filename?: string }[];
    reason?: string;
}

export class RestClient {
    public token: string;
    public baseURL: string;
    public version: string;
    public userAgent: string;

    constructor(options: RestOptions) {
        this.token = options.token;
        this.version = options.version || API_VERSION;
        this.baseURL = options.baseURL || BASE_URL;
        this.userAgent = options.userAgent || `fluxer.js/1.0.0 (Node.js)`;
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
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
            headers['X-Audit-Log-Reason'] = options.reason;
        }

        let body: BodyInit | undefined | null = options.body;

        if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof URLSearchParams) && !(body instanceof Blob) && !ArrayBuffer.isView(body)) {
             headers['Content-Type'] = 'application/json';
             body = JSON.stringify(body);
        }

        const fetchOptions: RequestInit = {
            ...options,
            headers,
            body
        };

        const response = await fetch(url.toString(), fetchOptions);

        if (!response.ok) {
            let errorBody;
            try {
                errorBody = await response.json();
            } catch {
                try {
                     errorBody = await response.text();
                } catch {
                     errorBody = 'Unknown error';
                }
            }
            throw new Error(`Request to ${endpoint} failed with status ${response.status}: ${typeof errorBody === 'object' ? JSON.stringify(errorBody) : errorBody}`);
        }

        if (response.status === 204) {
            return {} as T;
        }

        return await response.json() as T;
    }

    public async get<T>(endpoint: string, query?: Record<string, any>): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET', query });
    }

    public async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'POST', body });
    }

    public async patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
    }

    public async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'PUT', body });
    }

    public async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}
