import type { Client } from '../client';
import { Message as MessageData, Embed, Attachment, Reaction } from '../types';
import { User } from './User';
import { Channel, MessageCreateData } from './Channel';

export class Message {
    public readonly client: Client;
    public readonly id: string;
    public content: string;
    public channelId: string;
    public guildId: string | null;
    public author: User;
    public timestamp: Date;
    public editedTimestamp: Date | null;
    public tts: boolean;
    public mentionEveryone: boolean;
    public mentions: User[];
    public mentionRoles: string[];
    public attachments: Attachment[];
    public embeds: Embed[];
    public reactions: Reaction[];
    public pinned: boolean;
    public webhookId: string | null;
    public type: number;
    public flags: number;
    public referencedMessage: Message | null;
    public nonce: string | number | null;

    constructor(client: Client, data: MessageData) {
        this.client = client;
        this.id = data.id;
        this.content = data.content;
        this.channelId = data.channel_id;
        this.guildId = (data as any).guild_id || null;
        this.author = new User(client, data.author);
        this.timestamp = new Date(data.timestamp);
        this.editedTimestamp = data.edited_timestamp ? new Date(data.edited_timestamp) : null;
        this.tts = data.tts;
        this.mentionEveryone = data.mention_everyone;
        this.mentions = (data.mentions || []).map(u => new User(client, u));
        this.mentionRoles = data.mention_roles || [];
        this.attachments = data.attachments || [];
        this.embeds = data.embeds || [];
        this.reactions = data.reactions || [];
        this.pinned = data.pinned;
        this.webhookId = data.webhook_id || null;
        this.type = data.type;
        this.flags = data.flags || 0;
        this.referencedMessage = data.referenced_message
            ? new Message(client, data.referenced_message)
            : null;
        this.nonce = data.nonce ?? null;
    }

    get createdAt(): Date {
        const { getCreationDate } = require('../util');
        return getCreationDate(this.id);
    }

    get url(): string {
        return `https://fluxer.app/channels/${this.guildId || '@me'}/${this.channelId}/${this.id}`;
    }

    /** Reply to this message */
    async reply(content: string | MessageCreateData): Promise<Message> {
        const body: MessageCreateData = typeof content === 'string'
            ? { content, message_reference: { message_id: this.id } }
            : { ...content, message_reference: { message_id: this.id } };

        const data = await this.client.rest.post<MessageData>(`/channels/${this.channelId}/messages`, body);
        return new Message(this.client, data);
    }

    /** Edit this message */
    async edit(content: string | Partial<MessageCreateData>): Promise<Message> {
        const body = typeof content === 'string' ? { content } : content;
        const data = await this.client.rest.patch<MessageData>(
            `/channels/${this.channelId}/messages/${this.id}`,
            body,
        );
        return new Message(this.client, data);
    }

    /** Delete this message */
    async delete(reason?: string): Promise<void> {
        await this.client.rest.delete(`/channels/${this.channelId}/messages/${this.id}`, { reason });
    }

    /** Pin this message */
    async pin(): Promise<void> {
        await this.client.rest.put(`/channels/${this.channelId}/pins/${this.id}`);
    }

    /** Unpin this message */
    async unpin(): Promise<void> {
        await this.client.rest.delete(`/channels/${this.channelId}/pins/${this.id}`);
    }

    /** React to this message */
    async react(emoji: string): Promise<void> {
        const encoded = encodeURIComponent(emoji);
        await this.client.rest.put(`/channels/${this.channelId}/messages/${this.id}/reactions/${encoded}/@me`);
    }

    /** Remove own reaction */
    async unreact(emoji: string): Promise<void> {
        const encoded = encodeURIComponent(emoji);
        await this.client.rest.delete(`/channels/${this.channelId}/messages/${this.id}/reactions/${encoded}/@me`);
    }

    /** Fetch the channel this message is in */
    async fetchChannel(): Promise<Channel> {
        const { Channel: ChannelClass } = require('./Channel');
        const data = await this.client.rest.get<any>(`/channels/${this.channelId}`);
        return new ChannelClass(this.client, data);
    }

    /** Check if this message was sent by a bot */
    get isBot(): boolean {
        return this.author.bot;
    }

    /** Check if this message is a system message */
    get isSystem(): boolean {
        return this.type !== 0 && this.type !== 19;
    }

    toString(): string {
        return this.content;
    }

    toJSON(): MessageData {
        return {
            id: this.id,
            channel_id: this.channelId,
            author: this.author.toJSON(),
            content: this.content,
            timestamp: this.timestamp.toISOString(),
            edited_timestamp: this.editedTimestamp?.toISOString() || null,
            tts: this.tts,
            mention_everyone: this.mentionEveryone,
            mentions: this.mentions.map(u => u.toJSON()),
            mention_roles: this.mentionRoles,
            attachments: this.attachments,
            embeds: this.embeds,
            reactions: this.reactions,
            pinned: this.pinned,
            webhook_id: this.webhookId || undefined,
            type: this.type,
            flags: this.flags,
        };
    }
}
