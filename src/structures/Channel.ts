import type { Client } from '../client';
import { Channel as ChannelData, Message as MessageData } from '../types';
import { Message } from './Message';
import { ChannelType } from '../consts';

export interface MessageFetchOptions {
    limit?: number;
    before?: string;
    after?: string;
    around?: string;
}

export interface MessageCreateData {
    content?: string;
    embeds?: any[];
    message_reference?: { message_id: string };
    components?: any[];
    tts?: boolean;
    flags?: number;
}

export class Channel {
    public readonly client: Client;
    public readonly id: string;
    public name: string | null;
    public type: number;
    public guildId: string | null;
    public position: number | null;
    public topic: string | null;
    public nsfw: boolean;
    public parentId: string | null;
    public rateLimitPerUser: number;
    public lastMessageId: string | null;
    public bitrate: number | null;
    public userLimit: number | null;

    constructor(client: Client, data: ChannelData) {
        this.client = client;
        this.id = data.id;
        this.name = data.name || null;
        this.type = data.type;
        this.guildId = data.guild_id || null;
        this.position = data.position ?? null;
        this.topic = data.topic || null;
        this.nsfw = !!data.nsfw;
        this.parentId = data.parent_id || null;
        this.rateLimitPerUser = data.rate_limit_per_user || 0;
        this.lastMessageId = data.last_message_id || null;
        this.bitrate = data.bitrate || null;
        this.userLimit = data.user_limit || null;
    }

    get createdAt(): Date {
        const { getCreationDate } = require('../util');
        return getCreationDate(this.id);
    }

    get isText(): boolean {
        return [ChannelType.GuildText, ChannelType.DM, ChannelType.GroupDM, ChannelType.GuildAnnouncement].includes(this.type);
    }

    get isVoice(): boolean {
        return [ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(this.type);
    }

    get isDM(): boolean {
        return [ChannelType.DM, ChannelType.GroupDM].includes(this.type);
    }

    get isCategory(): boolean {
        return this.type === ChannelType.GuildCategory;
    }

    get mention(): string {
        return `<#${this.id}>`;
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

    /** Fetch a single message by ID */
    async fetchMessage(messageId: string): Promise<Message> {
        const data = await this.client.rest.get<MessageData>(`/channels/${this.id}/messages/${messageId}`);
        return new Message(this.client, data);
    }

    /** Delete this channel */
    async delete(reason?: string): Promise<void> {
        await this.client.rest.delete(`/channels/${this.id}`, { reason });
    }

    /** Edit this channel */
    async edit(data: Partial<{ name: string; topic: string; nsfw: boolean; rate_limit_per_user: number; position: number; parent_id: string | null }>, reason?: string): Promise<Channel> {
        const updated = await this.client.rest.patch<ChannelData>(`/channels/${this.id}`, data, { reason });
        return new Channel(this.client, updated);
    }

    /** Send typing indicator */
    async sendTyping(): Promise<void> {
        await this.client.rest.post(`/channels/${this.id}/typing`);
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

    /** Get channel invites */
    async fetchInvites(): Promise<any[]> {
        return this.client.rest.get(`/channels/${this.id}/invites`);
    }

    /** Create a channel invite */
    async createInvite(options: { max_age?: number; max_uses?: number; temporary?: boolean; unique?: boolean } = {}): Promise<any> {
        return this.client.rest.post(`/channels/${this.id}/invites`, options);
    }

    /** Set permission overwrite for a role or user */
    async setPermissionOverwrite(targetId: string, data: { type: number; allow: string; deny: string }): Promise<void> {
        await this.client.rest.put(`/channels/${this.id}/permissions/${targetId}`, data);
    }

    /** Delete permission overwrite */
    async deletePermissionOverwrite(targetId: string): Promise<void> {
        await this.client.rest.delete(`/channels/${this.id}/permissions/${targetId}`);
    }

    /** Get pinned messages */
    async fetchPinnedMessages(): Promise<Message[]> {
        const messages = await this.client.rest.get<MessageData[]>(`/channels/${this.id}/pins`);
        return messages.map(m => new Message(this.client, m));
    }

    /** Pin a message */
    async pinMessage(messageId: string): Promise<void> {
        await this.client.rest.put(`/channels/${this.id}/pins/${messageId}`);
    }

    /** Unpin a message */
    async unpinMessage(messageId: string): Promise<void> {
        await this.client.rest.delete(`/channels/${this.id}/pins/${messageId}`);
    }

    /** Create webhook for this channel */
    async createWebhook(data: { name: string; avatar?: string }): Promise<any> {
        return this.client.rest.post(`/channels/${this.id}/webhooks`, data);
    }

    /** Fetch webhooks for this channel */
    async fetchWebhooks(): Promise<any[]> {
        return this.client.rest.get(`/channels/${this.id}/webhooks`);
    }

    toString(): string {
        return `<#${this.id}>`;
    }

    toJSON(): ChannelData {
        return {
            id: this.id,
            type: this.type,
            guild_id: this.guildId || undefined,
            name: this.name || undefined,
            topic: this.topic || undefined,
            position: this.position ?? undefined,
            nsfw: this.nsfw,
            parent_id: this.parentId || undefined,
            rate_limit_per_user: this.rateLimitPerUser,
            last_message_id: this.lastMessageId || undefined,
            bitrate: this.bitrate || undefined,
            user_limit: this.userLimit || undefined,
        };
    }
}
