import { DataManager } from '../../managers/DataManager';
import { Collection } from '../../collections/Collection';
import type { Snowflake } from '../../types';

export interface PaginatedFetchOptions {
    limit?: number;
    before?: Snowflake;
    after?: Snowflake;
    around?: Snowflake;
    cache?: boolean;
}

export abstract class PaginatedManager<K extends string, T, R> extends DataManager<K, T, R> {
    /**
     * Fetches multiple items with pagination support.
     */
    public abstract fetchMany(options?: PaginatedFetchOptions): Promise<Collection<K, T>>;

    /**
     * Fetches all items by automatically paginating.
     */
    public async fetchAll(options: Omit<PaginatedFetchOptions, 'limit'> = {}): Promise<Collection<K, T>> {
        const collection = new Collection<K, T>();
        let lastId = options.after;
        const limit = 100;

        while (true) {
            const fetched = await this.fetchMany({ ...options, limit, after: lastId });
            if (fetched.size === 0) break;

            for (const [key, value] of fetched) {
                collection.set(key, value);
            }

            const keys = fetched.keyArray();
            lastId = keys[keys.length - 1] as unknown as Snowflake;
            if (fetched.size < limit) break;
        }

        return collection;
    }
}
