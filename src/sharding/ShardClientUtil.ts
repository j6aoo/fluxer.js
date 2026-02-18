import { Client } from '../client';

export class ShardClientUtil {
    public client: Client;
    public id: number;
    public count: number;

    constructor(client: Client) {
        this.client = client;
        this.id = parseInt(process.env.SHARD_ID || '0');
        this.count = parseInt(process.env.SHARD_COUNT || '1');
    }

    public static get singleton(): ShardClientUtil | null {
        return (global as any)._shardClientUtil || null;
    }

    public async broadcastEval(script: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const id = Math.random().toString(36).substring(7);
            const onMessage = (msg: any) => {
                if (msg && msg._fluxer_shard_eval_resp && msg._fluxer_id === id) {
                    process.off('message', onMessage);
                    if (msg.error) reject(new Error(msg.error));
                    else resolve(msg.results);
                }
            };
            process.on('message', onMessage);
            process.send!({ _fluxer_shard_eval: true, _fluxer_id: id, script });
        });
    }

    public async fetchClientValue(prop: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const id = Math.random().toString(36).substring(7);
            const onMessage = (msg: any) => {
                if (msg && msg._fluxer_shard_fetch_resp && msg._fluxer_id === id) {
                    process.off('message', onMessage);
                    if (msg.error) reject(new Error(msg.error));
                    else resolve(msg.results);
                }
            };
            process.on('message', onMessage);
            process.send!({ _fluxer_shard_fetch: true, _fluxer_id: id, prop });
        });
    }

    public async respawnAll(): Promise<void> {
        process.send!({ _fluxer_shard_respawn_all: true });
    }

    public sendReady(): void {
        process.send!('READY');
    }

    public _handleMessage(message: any): void {
        if (message && message._fluxer_shard_eval) {
            try {
                // eslint-disable-next-line no-eval
                const result = eval(message.script);
                process.send!({ _fluxer_shard_eval_resp: true, _fluxer_id: message._fluxer_id, result });
            } catch (error: any) {
                process.send!({ _fluxer_shard_eval_resp: true, _fluxer_id: message._fluxer_id, error: error.message });
            }
        } else if (message && message._fluxer_shard_fetch) {
            try {
                const result = (this.client as any)[message.prop];
                process.send!({ _fluxer_shard_fetch_resp: true, _fluxer_id: message._fluxer_id, result });
            } catch (error: any) {
                process.send!({ _fluxer_shard_fetch_resp: true, _fluxer_id: message._fluxer_id, error: error.message });
            }
        }
    }
}
