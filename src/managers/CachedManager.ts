import { Collection } from '../collections/Collection';
import { BaseManager } from './BaseManager';
import type { Client } from '../client';

export abstract class CachedManager<K, Holds, R> extends BaseManager {
    public readonly cache: Collection<K, Holds>;
    protected abstract _holds: new (client: Client, data: any) => Holds;

    constructor(client: Client) {
        super(client);
        this.cache = new Collection();
    }

    public resolve(resolvable: R | Holds): Holds | null {
        if (resolvable instanceof this._holds) return resolvable;
        if (typeof resolvable === 'string') return this.cache.get(resolvable as unknown as K) ?? null;
        return null;
    }

    public resolveId(resolvable: R | Holds): K | null {
        if (resolvable instanceof this._holds) return (resolvable as any).id;
        if (typeof resolvable === 'string') return resolvable as unknown as K;
        return null;
    }
}
