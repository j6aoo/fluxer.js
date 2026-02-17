export class Collection<K, V> extends Map<K, V> {
    public find(fn: (value: V, key: K, collection: this) => boolean): V | undefined {
        for (const [key, val] of this) {
            if (fn(val, key, this)) return val;
        }
        return undefined;
    }

    public filter(fn: (value: V, key: K, collection: this) => boolean): Collection<K, V> {
        const results = new Collection<K, V>();
        for (const [key, val] of this) {
            if (fn(val, key, this)) results.set(key, val);
        }
        return results;
    }

    public map<T>(fn: (value: V, key: K, collection: this) => T): T[] {
        const results: T[] = [];
        for (const [key, val] of this) {
            results.push(fn(val, key, this));
        }
        return results;
    }

    public some(fn: (value: V, key: K, collection: this) => boolean): boolean {
        for (const [key, val] of this) {
            if (fn(val, key, this)) return true;
        }
        return false;
    }

    public every(fn: (value: V, key: K, collection: this) => boolean): boolean {
        for (const [key, val] of this) {
            if (!fn(val, key, this)) return false;
        }
        return true;
    }

    public reduce<T>(fn: (accumulator: T, value: V, key: K, collection: this) => T, initialValue: T): T {
        let accumulator = initialValue;
        for (const [key, val] of this) {
            accumulator = fn(accumulator, val, key, this);
        }
        return accumulator;
    }

    public first(): V | undefined;
    public first(amount: number): V[];
    public first(amount?: number): V | V[] | undefined {
        if (amount === undefined) return this.values().next().value;
        if (amount < 0) return this.last(amount * -1);
        amount = Math.min(this.size, amount);
        const iter = this.values();
        return Array.from({ length: amount }, () => iter.next().value) as V[];
    }

    public last(): V | undefined;
    public last(amount: number): V[];
    public last(amount?: number): V | V[] | undefined {
        const arr = [...this.values()];
        if (amount === undefined) return arr[arr.length - 1];
        if (amount < 0) return this.first(amount * -1);
        if (!amount) return [];
        return arr.slice(-amount);
    }

    public random(): V | undefined;
    public random(amount: number): V[];
    public random(amount?: number): V | V[] | undefined {
        const arr = [...this.values()];
        if (amount === undefined) return arr[Math.floor(Math.random() * arr.length)];
        return Array.from({ length: Math.min(amount, arr.length) }, () =>
            arr.splice(Math.floor(Math.random() * arr.length), 1)[0]
        );
    }

    public toArray(): V[] {
        return [...this.values()];
    }

    public keyArray(): K[] {
        return [...this.keys()];
    }

    public clone(): Collection<K, V> {
        return new Collection<K, V>(this);
    }

    public sorted(compareFn?: (a: V, b: V, aKey: K, bKey: K) => number): Collection<K, V> {
        const entries = [...this.entries()];
        entries.sort((a, b) => compareFn ? compareFn(a[1], b[1], a[0], b[0]) : 0);
        return new Collection<K, V>(entries);
    }
}
