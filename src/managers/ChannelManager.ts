import { BaseChannel, createChannel, TextChannel, VoiceChannel, DMChannel, CategoryChannel, ThreadChannel } from '../structures/Channel';
import { Message } from '../structures/Message';
import { DataManager } from './DataManager';
import { Channel as ChannelData, Message as MessageData, RTCRegion } from '../types';

export class ChannelManager extends DataManager<string, BaseChannel, string> {
    protected _holds = BaseChannel as any;

    /** Fetch a channel by ID */
    async fetch(channelId: string, force = false): Promise<BaseChannel> {
        if (!force) {
            const cached = this.cache.get(channelId);
            if (cached) return cached;
        }

        const data = await this.client.rest.get<ChannelData>(`/channels/${channelId}`);
        return this._add(data);
    }

    /** Create a new channel */
    async create(guildId: string, options: { name: string; type?: number; topic?: string; parent_id?: string; nsfw?: boolean; position?: number }, reason?: string): Promise<BaseChannel> {
        const data = await this.client.rest.post<ChannelData>(`/guilds/${guildId}/channels`, options, { reason });
        return this._add(data);
    }

    /** Create a text channel */
    async createText(guildId: string, name: string, options: any = {}): Promise<TextChannel> {
        return this.create(guildId, { ...options, name, type: 0 }) as Promise<TextChannel>;
    }

    /** Create a voice channel */
    async createVoice(guildId: string, name: string, options: any = {}): Promise<VoiceChannel> {
        return this.create(guildId, { ...options, name, type: 2 }) as Promise<VoiceChannel>;
    }

    /** Create a category channel */
    async createCategory(guildId: string, name: string, options: any = {}): Promise<CategoryChannel> {
        return this.create(guildId, { ...options, name, type: 4 }) as Promise<CategoryChannel>;
    }

    /** Send a message to a channel */
    async send(channelId: string, content: string | object): Promise<Message> {
        const body = typeof content === 'string' ? { content } : content;
        const data = await this.client.rest.post<MessageData>(`/channels/${channelId}/messages`, body);
        return new Message(this.client, data);
    }

    /** Trigger typing indicator */
    async typing(channelId: string): Promise<void> {
        await this.client.rest.post(`/channels/${channelId}/typing`);
    }

    /** Acknowledge a message */
    async ackMessage(channelId: string, messageId: string, mentionCount?: number): Promise<void> {
        const body = mentionCount !== undefined ? { mention_count: mentionCount } : undefined;
        await this.client.rest.post(`/channels/${channelId}/messages/${messageId}/ack`, body);
    }

    /** Fetch RTC regions for a channel */
    async getRTCRegions(channelId: string): Promise<RTCRegion[]> {
        return this.client.rest.get<RTCRegion[]>(`/channels/${channelId}/rtc-regions`);
    }

    /** Bulk delete messages */
    async bulkDelete(channelId: string, messageIds: string[]): Promise<void> {
        if (messageIds.length === 0) return;
        if (messageIds.length === 1) {
            await this.client.rest.delete(`/channels/${channelId}/messages/${messageIds[0]}`);
            return;
        }
        await this.client.rest.post(`/channels/${channelId}/messages/bulk-delete`, {
            message_ids: messageIds,
        });
    }

    /** Delete a channel */
    async delete(channelId: string, reason?: string): Promise<void> {
        await this.client.rest.delete(`/channels/${channelId}`, { reason });
        this._remove(channelId);
    }

    /** Edit a channel */
    async edit(channelId: string, data: any, reason?: string): Promise<BaseChannel> {
        const updated = await this.client.rest.patch<ChannelData>(`/channels/${channelId}`, data, { reason });
        return this._add(updated);
    }

    /** Edit channel permissions for a user or role */
    async editPermissions(channelId: string, overwriteId: string, options: {
        type: 'role' | 'member';
        allow?: string | bigint;
        deny?: string | bigint;
    }, reason?: string): Promise<void> {
        await this.client.rest.put(`/channels/${channelId}/permissions/${overwriteId}`, {
            type: options.type === 'role' ? 0 : 1,
            allow: options.allow !== undefined ? String(options.allow) : undefined,
            deny: options.deny !== undefined ? String(options.deny) : undefined,
        }, { reason });
    }

    /** Delete channel permission overwrite */
    async deletePermission(channelId: string, overwriteId: string, reason?: string): Promise<void> {
        await this.client.rest.delete(`/channels/${channelId}/permissions/${overwriteId}`, { reason });
    }

    /** Add a recipient to a DM or Group DM channel */
    async addRecipient(channelId: string, userId: string, options: {
        accessToken: string;
        nick?: string;
    }): Promise<void> {
        await this.client.rest.put(`/channels/${channelId}/recipients/${userId}`, {
            access_token: options.accessToken,
            nick: options.nick,
        });
    }

    /** Remove a recipient from a DM or Group DM channel */
    async removeRecipient(channelId: string, userId: string): Promise<void> {
        await this.client.rest.delete(`/channels/${channelId}/recipients/${userId}`);
    }

    /** Pin a message in a channel */
    async pinMessage(channelId: string, messageId: string, reason?: string): Promise<void> {
        await this.client.rest.put(`/channels/${channelId}/pins/${messageId}`, {}, { reason });
    }

    /** Unpin a message from a channel */
    async unpinMessage(channelId: string, messageId: string, reason?: string): Promise<void> {
        await this.client.rest.delete(`/channels/${channelId}/pins/${messageId}`, { reason });
    }

    /** Add or update a channel in cache */
    _add(data: ChannelData, cache = true): BaseChannel {
        const existing = this.cache.get(data.id);
        if (existing) {
            if (cache) (existing as any)._patch(data);
            return existing;
        }

        const entry = createChannel(this.client, data);
        if (cache) this.cache.set(data.id, entry);
        return entry;
    }
}
