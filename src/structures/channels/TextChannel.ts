import type { Client } from '../../client';
import { BaseChannel } from './BaseChannel';
import { Channel as ChannelData, Message as MessageData } from '../../types';
import { MessageManager } from '../../managers/MessageManager';
import { Message } from '../Message';
import type { MessageCreateData, MessageFetchOptions } from '../Message';

import { InviteManager, InviteCreateOptions } from '../../managers/InviteManager';
import { Invite } from '../Invite';

export class TextChannel extends BaseChannel {
    public name: string | null = null;
    public topic: string | null = null;
    public nsfw: boolean = false;
    public rateLimitPerUser: number = 0;
    public lastMessageId: string | null = null;
    public readonly messages: MessageManager;

    constructor(client: Client, data: ChannelData) {
        super(client, data);
        this.messages = new MessageManager(client, this.id);
        this._patch(data);
    }

    _patch(data: ChannelData): void {
        super._patch(data);
        if (data.name !== undefined) this.name = data.name || null;
        if (data.topic !== undefined) this.topic = data.topic || null;
        if (data.nsfw !== undefined) this.nsfw = !!data.nsfw;
        if (data.rate_limit_per_user !== undefined) this.rateLimitPerUser = data.rate_limit_per_user || 0;
        if (data.last_message_id !== undefined) this.lastMessageId = data.last_message_id || null;
    }

    /** Send a message to this channel */
    async send(content: string | MessageCreateData): Promise<Message> {
        const body = typeof content === 'string' ? { content } : content;
        const data = await this.client.rest.post<MessageData>(`/channels/${this.id}/messages`, body);
        return new Message(this.client, data);
    }

    /** Fetch messages from this channel */
    async fetchMessages(options: MessageFetchOptions = {}): Promise<Message[]> {
        const query: Record<string, any> = {};
        if (options.limit) query.limit = options.limit;
        if (options.before) query.before = options.before;
        if (options.after) query.after = options.after;
        if (options.around) query.around = options.around;

        const messages = await this.client.rest.get<MessageData[]>(`/channels/${this.id}/messages`, query);
        return messages.map(m => new Message(this.client, m));
    }

    /** Bulk delete messages (2-100, max 14 days old) */
    async bulkDelete(messageIds: string[]): Promise<void> {
        if (messageIds.length < 2 || messageIds.length > 100) {
            throw new Error('bulkDelete requires between 2 and 100 message IDs');
        }
        await this.client.rest.post(`/channels/${this.id}/messages/bulk-delete`, {
            message_ids: messageIds,
        });
    }

    /** Create a channel invite */
    async createInvite(options: InviteCreateOptions = {}, reason?: string): Promise<Invite> {
        return (this.client.channels.cache.get(this.id) as any)?.invites.create(options, reason);
    }

    /** Set rate limit per user */
    async setRateLimitPerUser(seconds: number, reason?: string): Promise<this> {
        return this.edit({ rate_limit_per_user: seconds }, reason);
    }

    toJSON(): any {
        return {
            ...super.toJSON(),
            name: this.name,
            topic: this.topic,
            nsfw: this.nsfw,
            rate_limit_per_user: this.rateLimitPerUser,
            last_message_id: this.lastMessageId,
        };
    }
}
