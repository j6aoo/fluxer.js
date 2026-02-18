import type { Client } from '../client';

/**
 * Base class for all structures
 * Provides non-enumerable client reference and patch functionality
 */
export abstract class Base {
    public readonly client: Client;

    constructor(client: Client) {
        Object.defineProperty(this, 'client', { 
            value: client, 
            enumerable: false, 
            writable: false,
            configurable: false
        });
        this.client = client;
    }

    /**
     * Update the structure with partial data without recreating
     * @param data - Partial data to update
     */
    abstract _patch(data: unknown): void;

    /**
     * Clone this structure
     * @protected
     */
    protected _clone(): this {
        return Object.assign(Object.create(this), this);
    }

    /**
     * Serialize to JSON - client is excluded because it's non-enumerable
     */
    toJSON(): Record<string, unknown> {
        const clone: Record<string, unknown> = {};
        for (const key in this) {
            if (key !== 'client') {
                clone[key] = (this as any)[key];
            }
        }
        return clone;
    }
}
