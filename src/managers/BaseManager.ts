import type { Client } from '../client';

export abstract class BaseManager {
    public readonly client: Client;

    constructor(client: Client) {
        Object.defineProperty(this, 'client', { value: client, enumerable: false, writable: false });
        this.client = client;
    }
}
