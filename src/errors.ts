export class FluxerError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FluxerError';
    }
}

export class FluxerAPIError extends Error {
    public status: number;
    public code: string;
    public endpoint: string;
    public method: string;

    constructor(message: string, status: number, code: string, endpoint: string, method: string) {
        super(message);
        this.name = 'FluxerAPIError';
        this.status = status;
        this.code = code;
        this.endpoint = endpoint;
        this.method = method;
    }
}

export class FluxerRateLimitError extends FluxerAPIError {
    public retryAfter: number;

    constructor(retryAfter: number, endpoint: string, method: string) {
        super(`Rate limited. Retry after ${retryAfter}ms`, 429, 'RATE_LIMITED', endpoint, method);
        this.name = 'FluxerRateLimitError';
        this.retryAfter = retryAfter;
    }
}

export class FluxerGatewayError extends Error {
    public code: number;

    constructor(message: string, code: number) {
        super(message);
        this.name = 'FluxerGatewayError';
        this.code = code;
    }
}
