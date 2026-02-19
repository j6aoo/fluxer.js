import { EventEmitter } from 'events';
import { Collection } from '../collections/Collection';
import { GatewayShard } from './GatewayShard';
import { Client } from '../client';
import { GatewayClientOptions } from '../gateway';
import { GATEWAY_URL } from '../consts';

export interface GatewayBotInfo {
    url: string;
    shards: number;
    session_start_limit: {
        total: number;
        remaining: number;
        reset_after: number;
        max_concurrency: number;
    };
}

export interface GatewayManagerOptions extends GatewayClientOptions {
    shardCount?: number | 'auto';
    shardList?: number[];
    totalShards?: number;
}

export class GatewayManager extends EventEmitter {
    public readonly client: Client;
    public readonly shards = new Collection<number, GatewayShard>();
    public totalShards: number = 1;
    public maxConcurrency: number = 1;
    public gatewayUrl: string = GATEWAY_URL;
    public options: GatewayManagerOptions;

    constructor(client: Client, options: GatewayManagerOptions) {
        super();
        this.client = client;
        this.options = options;
    }

    /**
     * Fetch gateway bot info from the API
     * This provides the recommended number of shards and session start limits
     */
    public async fetchGatewayBot(): Promise<GatewayBotInfo> {
        return this.client.rest.get<GatewayBotInfo>('/gateway/bot');
    }

    public async spawn(shardId: number): Promise<GatewayShard> {
        if (this.shards.has(shardId)) return this.shards.get(shardId)!;

        const shard = new GatewayShard(this, shardId);
        this.shards.set(shardId, shard);

        shard.on('ready', (data) => this.emit('shardReady', shardId, data));
        shard.on('resume', () => this.emit('shardResume', shardId));
        shard.on('disconnect', (code) => this.emit('shardDisconnect', shardId, code));
        shard.on('error', (err) => this.emit('shardError', shardId, err));
        shard.on('debug', (msg) => this.client.emit('debug', msg));
        
        shard.on('dispatch', (event, data) => {
            this.client.emit('shardDispatch', shardId, event, data);
            // Internal handling will be done by Client._setupGatewayListeners via shardDispatch or direct shard events
        });

        shard.connect();
        return shard;
    }

    public async connect(): Promise<void> {
        // Fetch gateway info if using auto shard count
        if (this.options.shardCount === 'auto' || !this.options.url) {
            try {
                const gatewayInfo = await this.fetchGatewayBot();
                this.gatewayUrl = gatewayInfo.url;
                this.maxConcurrency = gatewayInfo.session_start_limit.max_concurrency;
                
                if (this.options.shardCount === 'auto') {
                    this.totalShards = gatewayInfo.shards;
                }
                
                this.client.emit('debug', `[GatewayManager] Fetched gateway info: ${gatewayInfo.shards} shards recommended, max concurrency: ${this.maxConcurrency}`);
            } catch (error) {
                this.client.emit('debug', `[GatewayManager] Failed to fetch gateway info, using defaults: ${error}`);
                this.gatewayUrl = this.options.url || GATEWAY_URL;
            }
        } else {
            this.gatewayUrl = this.options.url || GATEWAY_URL;
        }

        const shardList = this.options.shardList || 
            Array.from({ length: this.options.shardCount === 'auto' ? this.totalShards : (this.options.shardCount || 1) }, (_, i) => i);
        
        if (!this.options.totalShards) {
            this.totalShards = shardList.length;
        }

        // Spawn shards with proper concurrency
        const bucketSize = Math.ceil(shardList.length / this.maxConcurrency);
        
        for (let i = 0; i < shardList.length; i++) {
            const shardId = shardList[i];
            await this.spawn(shardId);
            
            // Respect rate limits: 5s between identifies within a bucket
            // With max_concurrency > 1, we can spawn multiple shards in parallel
            if ((i + 1) % this.maxConcurrency !== 0 && i < shardList.length - 1) {
                // Small delay between concurrent shards
                await new Promise(resolve => setTimeout(resolve, 100));
            } else if (i < shardList.length - 1) {
                // 5s delay between buckets
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }

    public disconnect(): void {
        for (const shard of this.shards.values()) {
            shard.destroy();
        }
        this.shards.clear();
    }

    public broadcast(op: number, d: any): void {
        for (const shard of this.shards.values()) {
            shard.send(op, d);
        }
    }

    public getPing(): number {
        if (this.shards.size === 0) return 0;
        const pings = Array.from(this.shards.values()).map(s => s.ping).filter(p => p >= 0);
        return pings.reduce((a, b) => a + b, 0) / (pings.length || 1);
    }

    public getShardIdForGuild(guildId: string): number {
        return Number((BigInt(guildId) >> 22n) % BigInt(this.totalShards));
    }

    public setPresence(presence: any): void {
        this.broadcast(3, {
            since: presence.since ?? null,
            activities: presence.activities || [],
            status: presence.status || 'online',
            afk: presence.afk || false,
        });
    }
}
