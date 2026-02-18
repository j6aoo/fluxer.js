import type { Client } from '../../client';
import { Base } from '../Base';
import { Channel as ChannelData } from '../../types';
import { getCreationDate } from '../../util';
import type { Guild } from '../Guild';

/**
 * Base class for all channels
 */
export abstract class BaseChannel extends Base {
    public readonly id: string;
    public type: number;
    public guildId: string | null;

    constructor(client: Client, data: ChannelData) {
        super(client);
        this.id = data.id;
        this.type = data.type;
        this.guildId = data.guild_id || null;
    }

    /**
     * The guild this channel belongs to
     */
    get guild(): Guild | null {
        return this.guildId ? this.client.guilds.cache.get(this.guildId) || null : null;
    }

    /**
     * The date this channel was created
     */
    get createdAt(): Date {
        return getCreationDate(this.id);
    }

    /**
     * Update the structure with partial data
     */
    _patch(data: ChannelData): void {
        if (data.type !== undefined) this.type = data.type;
        if (data.guild_id !== undefined) this.guildId = data.guild_id || null;
    }

    /**
     * Delete this channel
     */
    async delete(reason?: string): Promise<void> {
        await this.client.rest.delete(`/channels/${this.id}`, { reason });
    }

    /**
     * Edit this channel
     */
    async edit(data: any, reason?: string): Promise<this> {
        const updated = await this.client.rest.patch<ChannelData>(`/channels/${this.id}`, data, { reason });
        this._patch(updated);
        return this;
    }

    toString(): string {
        return `<#${this.id}>`;
    }

    toJSON(): any {
        return {
            ...super.toJSON(),
            id: this.id,
            type: this.type,
            guild_id: this.guildId,
        };
    }
}
