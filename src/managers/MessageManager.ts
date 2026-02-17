import type { Client } from '../client';
import { Message } from '../structures/Message';
import { Collection } from '../collections/Collection';
import { Message as MessageData } from '../types';

export class MessageManager {
    public readonly client: Client;
    public readonly cache: Collection<string, Message>;
    public readonly channelId: string;

    constructor(client: Client, channelId: string) {
        this.client = client;
        this.channelId = channelId;
        this.cache = new Collection();
    }

    /** Fetch a specific message by ID */
    async fetch(messageId: string): Promise<Message> {
        const data = await this.client.rest.get<MessageData>(
            `/channels/${this.channelId}/messages/${messageId}`,
        );
        const message = new Message(this.client, data);
        this.cache.set(message.id, message);
        return message;
    }

    /** Fetch multiple messages */
    async fetchMany(options: { limit?: number; before?: string; after?: string; around?: string } = {}): Promise<Collection<string, Message>> {
        const query: Record<string, any> = {};
        if (options.limit) query.limit = options.limit;
        if (options.before) query.before = options.before;
        if (options.after) query.after = options.after;
        if (options.around) query.around = options.around;

        const messages = await this.client.rest.get<MessageData[]>(
            `/channels/${this.channelId}/messages`,
            query,
        );

        const result = new Collection<string, Message>();
        for (const data of messages) {
            const message = new Message(this.client, data);
            this.cache.set(message.id, message);
            result.set(message.id, message);
        }
        return result;
    }

    /** Delete a message */
    async delete(messageId: string, reason?: string): Promise<void> {
        await this.client.rest.delete(`/channels/${this.channelId}/messages/${messageId}`, { reason });
        this.cache.delete(messageId);
    }

    /** Bulk delete messages */
    async bulkDelete(messageIds: string[]): Promise<void> {
        if (messageIds.length === 1) {
            await this.delete(messageIds[0]);
            return;
        }
        await this.client.rest.post(`/channels/${this.channelId}/messages/bulk-delete`, {
            message_ids: messageIds,
        });
        for (const id of messageIds) this.cache.delete(id);
    }

    /** Add or update a message in cache */
    _add(data: MessageData): Message {
        const message = new Message(this.client, data);
        this.cache.set(message.id, message);
        return message;
    }

    /** Remove a message from cache */
    _remove(messageId: string): void {
        this.cache.delete(messageId);
    }
}
