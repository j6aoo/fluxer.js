import { EventEmitter } from 'events';
import { Collection } from '../collections/Collection';
import { Shard } from './Shard';

export interface ShardingManagerOptions {
    totalShards?: number | 'auto';
    respawn?: boolean;
    shardArgs?: string[];
    execArgv?: string[];
    token: string;
}

export class ShardingManager extends EventEmitter {
    public file: string;
    public totalShards: number;
    public shardArgs: string[];
    public execArgv: string[];
    public respawn: boolean;
    public token: string;
    public shards: Collection<number, Shard> = new Collection();

    constructor(file: string, options: ShardingManagerOptions) {
        super();
        this.file = file;
        this.token = options.token;
        this.totalShards = options.totalShards === 'auto' ? 1 : (options.totalShards || 1); // Simplificado para o exemplo
        this.shardArgs = options.shardArgs || [];
        this.execArgv = options.execArgv || [];
        this.respawn = options.respawn ?? true;
    }

    public async spawn(): Promise<Collection<number, Shard>> {
        for (let i = 0; i < this.totalShards; i++) {
            const shard = this.createShard(i);
            await shard.spawn();
        }
        return this.shards;
    }

    public createShard(id: number): Shard {
        const shard = new Shard(this, id);
        this.shards.set(id, shard);
        this.emit('shardCreate', shard);
        return shard;
    }

    public async broadcast(message: any): Promise<void[]> {
        const promises = this.shards.map(shard => shard.send(message));
        return Promise.all(promises);
    }

    public async broadcastEval(script: string): Promise<any[]> {
        const promises = this.shards.map(shard => {
            return new Promise((resolve, reject) => {
                const id = Math.random().toString(36).substring(7);
                const onMessage = (msg: any) => {
                    if (msg && msg._fluxer_shard_eval_resp && msg._fluxer_id === id) {
                        shard.process?.off('message', onMessage);
                        if (msg.error) reject(new Error(msg.error));
                        else resolve(msg.result);
                    }
                };
                shard.process?.on('message', onMessage);
                shard.send({ _fluxer_shard_eval: true, _fluxer_id: id, script });
            });
        });
        return Promise.all(promises);
    }

    public async fetchClientValues(prop: string): Promise<any[]> {
        const promises = this.shards.map(shard => {
            return new Promise((resolve, reject) => {
                const id = Math.random().toString(36).substring(7);
                const onMessage = (msg: any) => {
                    if (msg && msg._fluxer_shard_fetch_resp && msg._fluxer_id === id) {
                        shard.process?.off('message', onMessage);
                        if (msg.error) reject(new Error(msg.error));
                        else resolve(msg.result);
                    }
                };
                shard.process?.on('message', onMessage);
                shard.send({ _fluxer_shard_fetch: true, _fluxer_id: id, prop });
            });
        });
        return Promise.all(promises);
    }

    public async respawnAll(): Promise<Collection<number, Shard>> {
        for (const shard of this.shards.values()) {
            await shard.respawn();
        }
        return this.shards;
    }
}
