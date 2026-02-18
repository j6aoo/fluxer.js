import { ChildProcess, fork } from 'child_process';
import { EventEmitter } from 'events';
import { ShardingManager } from './ShardingManager';

export class Shard extends EventEmitter {
    public id: number;
    public manager: ShardingManager;
    public process: ChildProcess | null = null;
    public args: string[];

    constructor(manager: ShardingManager, id: number) {
        super();
        this.id = id;
        this.manager = manager;
        this.args = manager.shardArgs;
    }

    public async spawn(): Promise<ChildProcess> {
        if (this.process) throw new Error(`Shard ${this.id} is already running.`);

        const env = {
            ...process.env,
            SHARD_ID: this.id.toString(),
            SHARD_COUNT: this.manager.totalShards.toString(),
            FLUXER_TOKEN: this.manager.token
        };

        this.process = fork(this.manager.file, this.args, {
            env,
            execArgv: this.manager.execArgv
        });

        this.process.on('message', (message: any) => {
            if (message && message._fluxer_shard_eval) {
                this._handleEval(message);
            } else if (message && message._fluxer_shard_fetch) {
                this._handleFetch(message);
            } else {
                this.manager.emit('message', message, this.id);
            }
        });

        this.process.on('exit', (code) => {
            this.process = null;
            this.emit('death', code);
            this.manager.emit('shardDeath', this);
            if (this.manager.respawn) this.respawn();
        });

        this.process.on('error', (error) => {
            this.emit('error', error);
            this.manager.emit('shardError', error, this);
        });

        return new Promise((resolve, reject) => {
            const onMessage = (msg: any) => {
                if (msg === 'READY') {
                    this.process?.off('message', onMessage);
                    this.emit('ready');
                    this.manager.emit('shardReady', this);
                    resolve(this.process!);
                }
            };
            this.process?.on('message', onMessage);
            
            // Timeout if it doesn't ready up
            setTimeout(() => {
                this.process?.off('message', onMessage);
                reject(new Error(`Shard ${this.id} failed to ready up in time.`));
            }, 30000);
        });
    }

    public kill(): void {
        if (this.process) {
            this.process.kill();
            this.process = null;
        }
    }

    public async respawn(): Promise<ChildProcess> {
        this.kill();
        return this.spawn();
    }

    public send(message: any): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.process) return reject(new Error(`Shard ${this.id} is not running.`));
            this.process.send(message, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    private async _handleEval(message: any): Promise<void> {
        try {
            const results = await this.manager.broadcastEval(message.script);
            this.send({ _fluxer_shard_eval_resp: true, _fluxer_id: message._fluxer_id, results });
        } catch (error: any) {
            this.send({ _fluxer_shard_eval_resp: true, _fluxer_id: message._fluxer_id, error: error.message });
        }
    }

    private async _handleFetch(message: any): Promise<void> {
        try {
            const results = await this.manager.fetchClientValues(message.prop);
            this.send({ _fluxer_shard_fetch_resp: true, _fluxer_id: message._fluxer_id, results });
        } catch (error: any) {
            this.send({ _fluxer_shard_fetch_resp: true, _fluxer_id: message._fluxer_id, error: error.message });
        }
    }
}
