import { Collection } from './Collection';

export interface CollectionOptions<K, V> {
    maxSize?: number;
    keepOverLimit?: (value: V, key: K, collection: LimitedCollection<K, V>) => boolean;
}

export interface SweeperOptions<K, V> {
    interval: number;
    filter: () => (value: V, key: K, collection: LimitedCollection<K, V>) => boolean;
}

/**
 * A collection with a maximum size and an optional sweeper to remove items.
 * @extends Collection
 */
export class LimitedCollection<K, V> extends Collection<K, V> {
    public maxSize: number;
    public keepOverLimit?: (value: V, key: K, collection: LimitedCollection<K, V>) => boolean;
    private _sweeperInterval: NodeJS.Timeout | null = null;

    public constructor(options: CollectionOptions<K, V> = {}, iterable?: Iterable<readonly [K, V]>) {
        super(iterable);
        this.maxSize = options.maxSize ?? Infinity;
        this.keepOverLimit = options.keepOverLimit;
    }

    /**
     * Sets an item in the collection, respecting the maximum size.
     * @param key The key of the item
     * @param value The value of the item
     * @returns This collection
     */
    public override set(key: K, value: V): this {
        if (this.maxSize <= 0) return this;

        if (this.size >= this.maxSize && !this.has(key)) {
            const iter = this.keys();
            const firstKey = iter.next().value;
            if (firstKey === undefined) return this;

            const firstValue = this.get(firstKey)!;

            if (this.keepOverLimit?.(firstValue, firstKey, this)) {
                for (const [k, v] of this) {
                    if (!this.keepOverLimit(v, k, this)) {
                        this.delete(k);
                        break;
                    }
                }
            } else {
                this.delete(firstKey);
            }
        }

        // Check again size after potential deletion
        if (this.size < this.maxSize || this.has(key)) {
            super.set(key, value);
        }

        return this;
    }

    /**
     * Removes items that pass the filter.
     * @param fn The filter function
     * @returns The number of items removed
     */
    public sweep(fn: (value: V, key: K, collection: this) => boolean): number {
        let count = 0;
        for (const [key, val] of this) {
            if (fn(val, key, this)) {
                this.delete(key);
                count++;
            }
        }
        return count;
    }

    /**
     * Starts the sweeper interval.
     * @param options Sweeper options
     */
    public startSweeper(options: SweeperOptions<K, V>): void {
        this.stopSweeper();
        this._sweeperInterval = setInterval(() => {
            const filter = options.filter();
            this.sweep(filter);
        }, options.interval);
    }

    /**
     * Stops the sweeper interval.
     */
    public stopSweeper(): void {
        if (this._sweeperInterval) {
            clearInterval(this._sweeperInterval);
            this._sweeperInterval = null;
        }
    }
}
