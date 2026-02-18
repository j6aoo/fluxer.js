import type { Client } from '../../client';
import { BaseChannel } from './BaseChannel';
import { Channel as ChannelData } from '../../types';
import { Collection } from '../../collections/Collection';
import type { Channel } from '../Channel';

export class CategoryChannel extends BaseChannel {
    public name: string | null = null;

    constructor(client: Client, data: ChannelData) {
        super(client, data);
        this._patch(data);
    }

    _patch(data: ChannelData): void {
        super._patch(data);
        if (data.name !== undefined) this.name = data.name || null;
    }

    /**
     * The channels that are under this category
     */
    get children(): Collection<string, any> {
        return this.client.channels.cache.filter((c: any) => c.parentId === this.id);
    }

    toJSON(): any {
        return {
            ...super.toJSON(),
            name: this.name,
        };
    }
}
