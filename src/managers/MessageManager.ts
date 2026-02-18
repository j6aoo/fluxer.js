import { Message } from '../structures/Message';
import { Collection } from '../collections/Collection';
import { DataManager } from './DataManager';
import type { Client } from '../client';
import { Message as MessageData } from '../types';
import { PaginatedManager, PaginatedFetchOptions } from '../structures/Managers/PaginatedManager';

export class MessageManager extends PaginatedManager<string, Message, string> {
    public readonly channelId: string;
    protected _holds = Message;

    constructor(client: Client, channelId: string) {
        super(client);
        this.channelId = channelId;
    }

    /** Fetch a specific message by ID */
    async fetch(messageId: string): Promise<Message> {
        const data = await this.client.rest.get<MessageData>(
            `/channels/${this.channelId}/messages/${messageId}`,
        );
        return this._add(data);
    }

    /** Fetch multiple messages */
    async fetchMany(options: PaginatedFetchOptions = {}): Promise<Collection<string, Message>> {
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
            const message = this._add(data, options.cache);
            result.set(message.id, message);
        }
        return result;
    }

    /** Fetch pinned messages */
    async fetchPinned(): Promise<Collection<string, Message>> {
        const data = await this.client.rest.get<MessageData[]>(`/channels/${this.channelId}/pins`);
        const messages = new Collection<string, Message>();
        for (const messageData of data) {
            const message = this._add(messageData);
            messages.set(message.id, message);
        }
        return messages;
    }

    /** Delete a message */
    async delete(messageId: string, reason?: string): Promise<void> {
        await this.client.rest.delete(`/channels/${this.channelId}/messages/${messageId}`, { reason });
        this._remove(messageId);
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
        for (const id of messageIds) this._remove(id);
    }

    /** Add or update a message in cache */
    _add(data: MessageData, cache = true): Message {
        return super._add(data, cache);
    }
}
