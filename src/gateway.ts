import WebSocket from 'ws';
import zlib from 'zlib';
import { promisify } from 'util';
import { EventEmitter } from 'events';
import { GATEWAY_URL } from './consts';
import { FluxerGatewayError } from './errors';
import { GatewayManager, GatewayManagerOptions } from './gateway/GatewayManager';
import { GatewayOpCodes, GatewayDispatchEvents, GatewayCloseCodes } from './gateway/GatewayEvents';

const inflateAsync = promisify(zlib.inflate);

export { GatewayOpCodes, GatewayDispatchEvents, GatewayCloseCodes };
export { GatewayManager, GatewayManagerOptions };
export { GatewayShard, ShardStatus } from './gateway/GatewayShard';

export interface GatewayClientOptions {
    token: string;
    intents?: number | bigint;
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
    private intents: number | bigint;
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
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private lastHeartbeatSent: number = 0;
    private lastHeartbeatAck: number = 0;
    private lastPing: number = 0;
    private _firstHeartbeatTimeout: NodeJS.Timeout | null = null;

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

        const gatewayUrl = this.getGatewayUrl();
        this.emit('debug', `[Gateway] Connecting to ${gatewayUrl}`);

        // Clean up old WebSocket to prevent memory leaks
        if (this.ws) {
            this.ws.removeAllListeners();
            try {
                this.ws.terminate();
            } catch {
                // Ignore terminate errors
            }
        }

        this.ws = new WebSocket(gatewayUrl);

        this.ws.on('open', () => {
            this.emit('debug', '[Gateway] WebSocket connection established');
            this.reconnectAttempts = 0;
        });

        this.ws.on('message', async (data: WebSocket.Data) => {
            const parsed = await this.parsePayload(data);
            if (!parsed) return;
            this.handlePayload(parsed);
        });

        this.ws.on('close', (code: number, reason: Buffer) => {
            const reasonStr = reason.toString();
            this.emit('debug', `[Gateway] Connection closed: ${code} - ${reasonStr}`);
            this.stopHeartbeat();

            // Always clean up the WebSocket reference
            this.ws = null;

            if (this.expectedClose || this.destroyed) {
                this.expectedClose = false;
                return;
            }

            // Handle non-resumable close codes
            const nonResumable = [4004, 4010, 4011, 4012, 4013, 4014];
            if (nonResumable.includes(code)) {
                this.emit('error', new FluxerGatewayError(`Gateway closed with non-resumable code: ${code}`, code));
                this.emit('disconnected', code);
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
                this.lastHeartbeatAck = Date.now();
                if (this.lastHeartbeatSent > 0) {
                    this.lastPing = this.lastHeartbeatAck - this.lastHeartbeatSent;
                }
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

        this.emit('debug', `[Gateway] Starting heartbeat every ${interval}ms`);

        // Send first heartbeat after jitter, then start the interval
        const jitter = Math.random();
        const firstHeartbeatTimeout = setTimeout(() => {
            this.sendHeartbeat();
            
            // Start the interval only after the first heartbeat is sent
            this.heartbeatInterval = setInterval(() => {
                if (!this.heartbeatAcked) {
                    this.emit('debug', '[Gateway] Heartbeat not acknowledged, reconnecting...');
                    this.reconnect();
                    return;
                }
                this.heartbeatAcked = false;
                this.sendHeartbeat();
            }, interval);
        }, interval * jitter);

        // Store the timeout so it can be cleared if needed
        this._firstHeartbeatTimeout = firstHeartbeatTimeout;
    }

    private stopHeartbeat(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        // Clear the first heartbeat timeout if it exists
        if (this._firstHeartbeatTimeout) {
            clearTimeout(this._firstHeartbeatTimeout);
            this._firstHeartbeatTimeout = null;
        }
    }

    private sendHeartbeat(): void {
        this.lastHeartbeatSent = Date.now();
        this.send(GatewayOpCodes.Heartbeat, this.lastSequence);
    }

    private identify(): void {
        const payload = {
            token: this.token,
            intents: typeof this.intents === 'bigint' ? Number(this.intents) : this.intents,
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
        this.attemptReconnect();
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

        // Clear any existing reconnect timeout to prevent multiple reconnects
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            if (!this.destroyed && !this.connected) {
                this.connect();
            }
        }, delay);
    }

    private getGatewayUrl(): string {
        const baseUrl = this.resumeGatewayUrl || this.url;
        if (!this.compress) return baseUrl;

        const separator = baseUrl.includes('?') ? '&' : '?';
        if (baseUrl.includes('compress=')) return baseUrl;
        return `${baseUrl}${separator}compress=zlib-stream`;
    }

    private async parsePayload(data: WebSocket.Data): Promise<any | null> {
        try {
            let content: string;
            if (this.compress && Buffer.isBuffer(data)) {
                // Use async inflate for better performance (non-blocking)
                content = (await inflateAsync(data)).toString();
            } else {
                content = data.toString();
            }
            return JSON.parse(content);
        } catch (err) {
            this.emit('error', new Error('Invalid JSON received'));
            this.ws?.close(1002, 'Invalid JSON');
            return null;
        }
    }

    private closeWebSocket(code: number = 1000): void {
        if (this.ws) {
            this.expectedClose = true;
            try {
                this.ws.close(code);
            } catch {
                // Ignore close errors
            }
            // Don't set ws to null immediately - let the close event handler do it
            // Don't reset expectedClose here - the close event handler needs it
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
        // Clear any pending reconnect timeout
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        this.closeWebSocket(1000);
        // Force close the WebSocket if it's still open
        if (this.ws) {
            try {
                this.ws.terminate();
            } catch {
                // Ignore terminate errors
            }
            this.ws = null;
        }
        this.sessionId = null;
        this.lastSequence = null;
        this.resumeGatewayUrl = null;
    }

    /** Check if the gateway is connected */
    public get connected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    /** Get ping (not directly available, tracked via heartbeat timing) */
    public get ping(): number {
        return this.lastPing;
    }
}
