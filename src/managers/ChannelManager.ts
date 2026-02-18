import { BaseChannel, createChannel, TextChannel, VoiceChannel, DMChannel, CategoryChannel, ThreadChannel } from '../structures/Channel';
import { Message } from '../structures/Message';
import { DataManager } from './DataManager';
import { Channel as ChannelData, Message as MessageData } from '../types';

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

