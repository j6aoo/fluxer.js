import type { Client } from '../client';
import { Channel } from '../structures/Channel';
import { Message } from '../structures/Message';
import { Collection } from '../collections/Collection';
import { Channel as ChannelData, Message as MessageData } from '../types';

export class ChannelManager {
    public readonly client: Client;
    public readonly cache: Collection<string, Channel>;

    constructor(client: Client) {
        this.client = client;
        this.cache = new Collection();
    }

    /** Fetch a channel by ID */
    async fetch(channelId: string, force = false): Promise<Channel> {
        if (!force) {
            const cached = this.cache.get(channelId);
            if (cached) return cached;
        }

        const data = await this.client.rest.get<ChannelData>(`/channels/${channelId}`);
        const channel = new Channel(this.client, data);
        this.cache.set(channel.id, channel);
        return channel;
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
        this.cache.delete(channelId);
    }

    /** Edit a channel */
    async edit(channelId: string, data: any, reason?: string): Promise<Channel> {
        const updated = await this.client.rest.patch<ChannelData>(`/channels/${channelId}`, data, { reason });
        const channel = new Channel(this.client, updated);
        this.cache.set(channel.id, channel);
        return channel;
    }

    /** Add or update a channel in cache */
    _add(data: ChannelData): Channel {
        const channel = new Channel(this.client, data);
        this.cache.set(channel.id, channel);
        return channel;
    }

    /** Remove a channel from cache */
    _remove(channelId: string): void {
        this.cache.delete(channelId);
    }
}
