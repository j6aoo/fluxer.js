import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { GATEWAY_URL } from './consts';

export enum GatewayOpCodes {
    Dispatch = 0,
    Heartbeat = 1,
    Identify = 2,
    Resume = 6,
    Reconnect = 7,
    InvalidSession = 9,
    Hello = 10,
    HeartbeatAck = 11,
}

export interface GatewayClientOptions {
    token: string;
    intents?: number;
    url?: string;
}

export class GatewayClient extends EventEmitter {
    private ws: WebSocket | null = null;
    private token: string;
    private intents: number;
    private url: string;
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private lastSequence: number | null = null;
    private sessionId: string | null = null;

    constructor(options: GatewayClientOptions) {
        super();
        this.token = options.token;
        this.intents = options.intents || 0;
        this.url = options.url || GATEWAY_URL;
    }

    public connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

        this.ws = new WebSocket(this.url);

        this.ws.on('open', () => {
            this.emit('debug', 'Connected to Gateway');
        });

        this.ws.on('message', (data: WebSocket.Data) => {
            let payload;
            try {
                payload = JSON.parse(data.toString());
            } catch (err) {
                this.emit('error', err);
                return;
            }

            this.handlePayload(payload);
        });

        this.ws.on('close', (code, reason) => {
            this.emit('debug', `Connection closed: ${code} - ${reason}`);
            this.cleanup();
            setTimeout(() => this.connect(), 5000);
        });

        this.ws.on('error', (err) => {
            this.emit('error', err);
        });
    }

    private handlePayload(payload: any) {
        const { op, d, s, t } = payload;

        if (s) {
            this.lastSequence = s;
        }

        switch (op) {
            case GatewayOpCodes.Hello:
                const interval = d.heartbeat_interval;
                this.startHeartbeat(interval);
                this.identify();
                break;
            
            case GatewayOpCodes.Dispatch:
                this.emit('raw', payload);
                if (t) {
                    this.emit(t, d);
                    const camelCase = t.toLowerCase().replace(/_([a-z])/g, (g: string) => g[1].toUpperCase());
                    if (camelCase !== t) {
                        this.emit(camelCase, d);
                    }
                    if (t === 'READY') {
                        this.sessionId = d.session_id;
                        this.emit('ready', d);
                    }
                }
                break;

            case GatewayOpCodes.Heartbeat:
                this.sendHeartbeat();
                break;

            case GatewayOpCodes.HeartbeatAck:
                this.emit('debug', 'Heartbeat acknowledged');
                break;
            
            case GatewayOpCodes.Reconnect:
                this.emit('debug', 'Gateway requested reconnect');
                this.ws?.close();
                break;

            case GatewayOpCodes.InvalidSession:
                this.emit('debug', 'Invalid session');
                this.ws?.close();
                break;
        }
    }

    private startHeartbeat(interval: number) {
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

        this.emit('debug', `Starting heartbeat every ${interval}ms`);
        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
        }, interval);
    }

    private sendHeartbeat() {
        this.emit('debug', 'Sending heartbeat');
        this.send(GatewayOpCodes.Heartbeat, this.lastSequence);
    }

    private identify() {
        const payload = {
            token: this.token,
            intents: Number(this.intents),
            properties: {
                os: process.platform,
                browser: 'fluxer.js',
                device: 'fluxer.js',
            }
        };
        this.emit('debug', `Identifying with payload: ${JSON.stringify({ ...payload, token: '[REDACTED]' })}`);
        this.send(GatewayOpCodes.Identify, payload);
    }

    public send(op: number, d: any) {
        this.sendPayload({ op, d });
    }

    private sendPayload(payload: any) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        this.ws.send(JSON.stringify(payload));
    }

    private cleanup() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        this.ws = null;
    }

    public disconnect() {
        this.cleanup();
        this.ws?.close();
    }
}
