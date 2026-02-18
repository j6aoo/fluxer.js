import { EventEmitter } from 'events';
import { Collection } from '../collections/Collection';
import { GatewayShard } from './GatewayShard';
import { Client } from '../client';
import { GatewayClientOptions } from '../gateway';
import { GATEWAY_URL } from '../consts';

export interface GatewayManagerOptions extends GatewayClientOptions {
    shardCount?: number | 'auto';
    shardList?: number[];
    totalShards?: number;
}

export class GatewayManager extends EventEmitter {
    public readonly client: Client;
    public readonly shards = new Collection<number, GatewayShard>();
    public totalShards: number = 1;
    public options: GatewayManagerOptions;

    constructor(client: Client, options: GatewayManagerOptions) {
        super();
        this.client = client;
        this.options = {
            url: GATEWAY_URL,
            ...options
        };
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
        const shardList = this.options.shardList || 
            Array.from({ length: this.options.shardCount === 'auto' ? 1 : (this.options.shardCount || 1) }, (_, i) => i);
        
        this.totalShards = this.options.totalShards || shardList.length;

        for (const shardId of shardList) {
            await this.spawn(shardId);
            // Discord recommends 5s between identifies per bucket, but we'll start simple
            // In a real SDK we'd implement a proper bucket ratelimiter
            await new Promise(resolve => setTimeout(resolve, 5000));
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
