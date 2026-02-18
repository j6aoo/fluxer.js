import { CachedManager } from './CachedManager';
import type { Client } from '../client';

export abstract class DataManager<K, Holds, R> extends CachedManager<K, Holds, R> {
    constructor(client: Client) {
        super(client);
    }

    /**
     * Internal method to add or update an object in the cache.
     * @param data The raw data from the API
     * @param cache Whether to cache the object
     * @param options Additional options
     */
    protected _add(data: any, cache = true, { id }: { id?: K } = {}): Holds {
        const objId = id ?? data.id;
        const existing = this.cache.get(objId);
        
        if (existing) {
            if (cache) {
                // In a real implementation, we would update the existing object here
                // For now, we'll just return it or replace it if necessary
                return existing;
            }
            return existing;
        }

        const entry = new this._holds(this.client, data);
        if (cache) this.cache.set(objId, entry);
        return entry;
    }

    /**
     * Internal method to remove an object from the cache.
     * @param id The ID of the object to remove
     */
    _remove(id: K): void {
        this.cache.delete(id);
    }
}
