import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { GatewayOpCodes, GatewayDispatchEvents } from './GatewayEvents';
import { FluxerGatewayError } from '../errors';
import { GatewayManager } from './GatewayManager';

export enum ShardStatus {
    Connecting = 'connecting',
    Ready = 'ready',
    Resuming = 'resuming',
    Disconnected = 'disconnected',
}

export class GatewayShard extends EventEmitter {
    public readonly id: number;
    private manager: GatewayManager;
    private ws: WebSocket | null = null;
    private sessionId: string | null = null;
    private sequence: number | null = null;
    private resumeGatewayUrl: string | null = null;
    public status: ShardStatus = ShardStatus.Disconnected;
    
    private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
    private heartbeatAcked: boolean = true;
    private lastHeartbeatSent: number = 0;
    private lastHeartbeatAck: number = 0;
    
    private reconnectAttempts: number = 0;
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private expectedClose: boolean = false;
    private destroyed: boolean = false;

    constructor(manager: GatewayManager, id: number) {
        super();
        this.manager = manager;
        this.id = id;
    }

    public connect(): void {
        if (this.destroyed) return;
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;

        this.status = ShardStatus.Connecting;
        const gatewayUrl = this.resumeGatewayUrl || this.manager.options.url || 'wss://gateway.fluxer.app';
        this.emit('debug', `[Shard ${this.id}] Connecting to ${gatewayUrl}`);

        this.ws = new WebSocket(gatewayUrl);

        this.ws.on('open', () => {
            this.emit('debug', `[Shard ${this.id}] WebSocket connection established`);
            this.reconnectAttempts = 0;
        });

        this.ws.on('message', (data: WebSocket.Data) => {
            let payload;
            try {
                payload = JSON.parse(data.toString());
            } catch (err) {
                this.emit('error', new FluxerGatewayError(`[Shard ${this.id}] Failed to parse gateway payload`, 0));
                return;
            }
            this.handlePayload(payload);
        });

        this.ws.on('close', (code: number, reason: Buffer) => {
            this.emit('debug', `[Shard ${this.id}] Connection closed: ${code} - ${reason.toString()}`);
            this.status = ShardStatus.Disconnected;
            this.stopHeartbeat();
            this.ws = null;

            if (this.expectedClose || this.destroyed) {
                this.expectedClose = false;
                return;
            }

            const nonResumable = [4004, 4010, 4011, 4012, 4013, 4014];
            if (nonResumable.includes(code)) {
                this.emit('error', new FluxerGatewayError(`[Shard ${this.id}] Gateway closed with non-resumable code: ${code}`, code));
                this.emit('close', code);
                return;
            }

            this.attemptReconnect();
        });

        this.ws.on('error', (err: Error) => {
            this.emit('error', err);
        });
    }

    private handlePayload(payload: any): void {
        const { op, d, s, t } = payload;

        if (s !== null && s !== undefined) {
            this.sequence = s;
        }

        switch (op) {
            case GatewayOpCodes.Hello: {
                const interval = d.heartbeat_interval;
                this.startHeartbeat(interval);

                if (this.sessionId && this.sequence) {
                    this.resume();
                } else {
                    this.identify();
                }
                break;
            }

            case GatewayOpCodes.Dispatch:
                if (t === GatewayDispatchEvents.Ready) {
                    this.sessionId = d.session_id;
                    this.resumeGatewayUrl = d.resume_gateway_url || null;
                    this.status = ShardStatus.Ready;
                    this.emit('ready', d);
                }

                if (t === GatewayDispatchEvents.Resumed) {
                    this.status = ShardStatus.Ready;
                    this.emit('resume');
                }

                this.emit('dispatch', t, d);
                this.manager.client.emit('raw', payload);
                break;

            case GatewayOpCodes.Heartbeat:
                this.sendHeartbeat();
                break;

            case GatewayOpCodes.HeartbeatAck:
                this.heartbeatAcked = true;
                this.lastHeartbeatAck = Date.now();
                break;

            case GatewayOpCodes.Reconnect:
                this.reconnect();
                break;

            case GatewayOpCodes.InvalidSession: {
                const resumable = d === true;
                if (!resumable) {
                    this.sessionId = null;
                    this.sequence = null;
                }
                setTimeout(() => this.reconnect(), Math.floor(Math.random() * 4000) + 1000);
                break;
            }
        }
    }

    private identify(): void {
        const payload = {
            token: this.manager.options.token,
            intents: Number(this.manager.options.intents),
            properties: {
                os: process.platform,
                browser: 'fluxer.js',
                device: 'fluxer.js',
            },
            shard: [this.id, this.manager.totalShards],
            compress: this.manager.options.compress,
            large_threshold: this.manager.options.largeThreshold,
            presence: {
                status: this.manager.options.presence?.status || 'online',
                activities: this.manager.options.presence?.activities || [],
                afk: this.manager.options.presence?.afk || false,
                since: this.manager.options.presence?.since ?? null,
            },
        };
        this.send(GatewayOpCodes.Identify, payload);
    }

    private resume(): void {
        this.status = ShardStatus.Resuming;
        const payload = {
            token: this.manager.options.token,
            session_id: this.sessionId,
            seq: this.sequence,
        };
        this.send(GatewayOpCodes.Resume, payload);
    }

    private startHeartbeat(interval: number): void {
        this.stopHeartbeat();
        this.heartbeatAcked = true;
        
        const jitter = Math.random();
        setTimeout(() => this.sendHeartbeat(), interval * jitter);

        this.heartbeatInterval = setInterval(() => {
            if (!this.heartbeatAcked) {
                this.reconnect();
                return;
            }
            this.heartbeatAcked = false;
            this.sendHeartbeat();
        }, interval);
    }

    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    private sendHeartbeat(): void {
        this.lastHeartbeatSent = Date.now();
        this.send(GatewayOpCodes.Heartbeat, this.sequence);
    }

    public reconnect(): void {
        this.disconnect(4000);
        this.connect();
    }

    private attemptReconnect(): void {
        if (this.destroyed) return;
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
        
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            this.connect();
        }, delay);
    }

    public disconnect(code: number = 1000): void {
        if (this.ws) {
            this.expectedClose = true;
            try {
                this.ws.close(code);
            } catch {}
        }
        this.stopHeartbeat();
    }

    public destroy(): void {
        this.destroyed = true;
        this.disconnect();
        if (this.ws) {
            try { this.ws.terminate(); } catch {}
            this.ws = null;
        }
        this.removeAllListeners();
    }

    public send(op: number, d: any): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ op, d }));
        }
    }

    public get ping(): number {
        return this.lastHeartbeatAck - this.lastHeartbeatSent;
    }
}
