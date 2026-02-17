import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { GATEWAY_URL } from './consts';
import { FluxerGatewayError } from './errors';

export enum GatewayOpCodes {
    Dispatch = 0,
    Heartbeat = 1,
    Identify = 2,
    PresenceUpdate = 3,
    VoiceStateUpdate = 4,
    Resume = 6,
    Reconnect = 7,
    RequestGuildMembers = 8,
    InvalidSession = 9,
    Hello = 10,
    HeartbeatAck = 11,
}

export interface GatewayClientOptions {
    token: string;
    intents?: number;
    url?: string;
    presence?: PresenceData;
    compress?: boolean;
    largeThreshold?: number;
}

export interface PresenceData {
    status?: 'online' | 'idle' | 'dnd' | 'invisible' | 'offline';
    activities?: ActivityData[];
    afk?: boolean;
    since?: number | null;
}

export interface ActivityData {
    name: string;
    type: number;
    url?: string;
}

/** Activity types */
export enum ActivityType {
    Playing = 0,
    Streaming = 1,
    Listening = 2,
    Watching = 3,
    Custom = 4,
    Competing = 5,
}

export class GatewayClient extends EventEmitter {
    private ws: WebSocket | null = null;
    private token: string;
    private intents: number;
    private url: string;
    private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
    private lastSequence: number | null = null;
    private sessionId: string | null = null;
    private resumeGatewayUrl: string | null = null;
    private heartbeatAcked: boolean = true;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 10;
    private destroyed: boolean = false;
    private presence: PresenceData;
    private compress: boolean;
    private largeThreshold: number;
    private expectedClose: boolean = false;

    constructor(options: GatewayClientOptions) {
        super();
        this.token = options.token;
        this.intents = options.intents || 0;
        this.url = options.url || GATEWAY_URL;
        this.presence = options.presence || { status: 'online', activities: [] };
        this.compress = options.compress || false;
        this.largeThreshold = options.largeThreshold || 50;
    }

    public connect(): void {
        if (this.destroyed) return;
        if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

        const gatewayUrl = this.resumeGatewayUrl || this.url;
        this.emit('debug', `[Gateway] Connecting to ${gatewayUrl}`);

        this.ws = new WebSocket(gatewayUrl);

        this.ws.on('open', () => {
            this.emit('debug', '[Gateway] WebSocket connection established');
            this.reconnectAttempts = 0;
        });

        this.ws.on('message', (data: WebSocket.Data) => {
            let payload;
            try {
                payload = JSON.parse(data.toString());
            } catch (err) {
                this.emit('error', new FluxerGatewayError('Failed to parse gateway payload', 0));
                return;
            }
            this.handlePayload(payload);
        });

        this.ws.on('close', (code: number, reason: Buffer) => {
            const reasonStr = reason.toString();
            this.emit('debug', `[Gateway] Connection closed: ${code} - ${reasonStr}`);
            this.stopHeartbeat();

            if (this.expectedClose || this.destroyed) {
                this.ws = null;
                return;
            }

            // Handle non-resumable close codes
            const nonResumable = [4004, 4010, 4011, 4012, 4013, 4014];
            if (nonResumable.includes(code)) {
                this.ws = null;
                this.emit('error', new FluxerGatewayError(`Gateway closed with non-resumable code: ${code}`, code));
                this.emit('disconnected', code);
                return;
            }

            this.ws = null;
            this.attemptReconnect();
        });

        this.ws.on('error', (err: Error) => {
            this.emit('error', err);
        });
    }

    private handlePayload(payload: any): void {
        const { op, d, s, t } = payload;

        if (s !== null && s !== undefined) {
            this.lastSequence = s;
        }

        switch (op) {
            case GatewayOpCodes.Hello: {
                const interval = d.heartbeat_interval;
                this.startHeartbeat(interval);

                if (this.sessionId && this.lastSequence) {
                    this.resume();
                } else {
                    this.identify();
                }
                break;
            }

            case GatewayOpCodes.Dispatch:
                this.emit('raw', payload);
                if (t) {
                    this.emit(t, d);

                    if (t === 'READY') {
                        this.sessionId = d.session_id;
                        this.resumeGatewayUrl = d.resume_gateway_url || null;
                        this.emit('debug', `[Gateway] READY. Session: ${this.sessionId}`);
                    }

                    if (t === 'RESUMED') {
                        this.emit('debug', '[Gateway] Session resumed successfully');
                    }
                }
                break;

            case GatewayOpCodes.Heartbeat:
                this.sendHeartbeat();
                break;

            case GatewayOpCodes.HeartbeatAck:
                this.heartbeatAcked = true;
                this.emit('debug', '[Gateway] Heartbeat acknowledged');
                break;

            case GatewayOpCodes.Reconnect:
                this.emit('debug', '[Gateway] Server requested reconnect');
                this.reconnect();
                break;

            case GatewayOpCodes.InvalidSession: {
                const resumable = d === true;
                this.emit('debug', `[Gateway] Invalid session. Resumable: ${resumable}`);

                if (!resumable) {
                    this.sessionId = null;
                    this.lastSequence = null;
                }

                // Wait 1-5 seconds then reconnect (per spec)
                const delay = Math.floor(Math.random() * 4000) + 1000;
                setTimeout(() => {
                    if (!this.destroyed) {
                        this.closeWebSocket(1000);
                        this.connect();
                    }
                }, delay);
                break;
            }
        }
    }

    private startHeartbeat(interval: number): void {
        this.stopHeartbeat();
        this.heartbeatAcked = true;

        // Send first heartbeat after jitter
        const jitter = Math.random();
        setTimeout(() => {
            this.sendHeartbeat();
        }, interval * jitter);

        this.emit('debug', `[Gateway] Starting heartbeat every ${interval}ms`);
        this.heartbeatInterval = setInterval(() => {
            if (!this.heartbeatAcked) {
                this.emit('debug', '[Gateway] Heartbeat not acknowledged, reconnecting...');
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
        this.send(GatewayOpCodes.Heartbeat, this.lastSequence);
    }

    private identify(): void {
        const payload = {
            token: this.token,
            intents: this.intents,
            properties: {
                os: process.platform,
                browser: 'fluxer.js',
                device: 'fluxer.js',
            },
            compress: this.compress,
            large_threshold: this.largeThreshold,
            presence: {
                status: this.presence.status || 'online',
                activities: this.presence.activities || [],
                afk: this.presence.afk || false,
                since: this.presence.since ?? null,
            },
        };
        this.emit('debug', '[Gateway] Sending IDENTIFY');
        this.send(GatewayOpCodes.Identify, payload);
    }

    private resume(): void {
        const payload = {
            token: this.token,
            session_id: this.sessionId,
            seq: this.lastSequence,
        };
        this.emit('debug', `[Gateway] Sending RESUME (session: ${this.sessionId}, seq: ${this.lastSequence})`);
        this.send(GatewayOpCodes.Resume, payload);
    }

    private reconnect(): void {
        this.closeWebSocket(4000);
        this.connect();
    }

    private attemptReconnect(): void {
        if (this.destroyed) return;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.emit('error', new FluxerGatewayError('Max reconnect attempts reached', 0));
            this.emit('disconnected', 0);
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
        this.emit('debug', `[Gateway] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            if (!this.destroyed) {
                this.connect();
            }
        }, delay);
    }

    private closeWebSocket(code: number = 1000): void {
        if (this.ws) {
            this.expectedClose = true;
            try {
                this.ws.close(code);
            } catch {
                // Ignore close errors
            }
            this.ws = null;
            this.expectedClose = false;
        }
        this.stopHeartbeat();
    }

    public send(op: number, d: any): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        this.ws.send(JSON.stringify({ op, d }));
    }

    /** Update the bot's presence */
    public setPresence(presence: PresenceData): void {
        this.presence = presence;
        this.send(GatewayOpCodes.PresenceUpdate, {
            since: presence.since ?? null,
            activities: presence.activities || [],
            status: presence.status || 'online',
            afk: presence.afk || false,
        });
    }

    /** Request guild members from the gateway */
    public requestGuildMembers(guildId: string, options: { query?: string; limit?: number; user_ids?: string[]; presences?: boolean } = {}): void {
        this.send(GatewayOpCodes.RequestGuildMembers, {
            guild_id: guildId,
            query: options.query ?? '',
            limit: options.limit ?? 0,
            user_ids: options.user_ids,
            presences: options.presences,
        });
    }

    /** Update voice state (join/leave/move voice channel) */
    public updateVoiceState(guildId: string, channelId: string | null, options: { self_mute?: boolean; self_deaf?: boolean } = {}): void {
        this.send(GatewayOpCodes.VoiceStateUpdate, {
            guild_id: guildId,
            channel_id: channelId,
            self_mute: options.self_mute ?? false,
            self_deaf: options.self_deaf ?? false,
        });
    }

    /** Gracefully disconnect from the gateway */
    public disconnect(): void {
        this.destroyed = true;
        this.closeWebSocket(1000);
        this.sessionId = null;
        this.lastSequence = null;
        this.resumeGatewayUrl = null;
        this.removeAllListeners();
    }

    /** Check if the gateway is connected */
    public get connected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    /** Get ping (not directly available, tracked via heartbeat timing) */
    public get ping(): number {
        return -1; // Would need heartbeat timing tracking
    }
}
