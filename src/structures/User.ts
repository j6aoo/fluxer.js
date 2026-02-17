import type { Client } from '../client';
import { User as UserData } from '../types';
import { getUserAvatarUrl, getDefaultAvatarUrl } from '../util';

export class User {
    public readonly client: Client;
    public readonly id: string;
    public username: string;
    public discriminator: string;
    public avatar: string | null;
    public banner: string | null;
    public bot: boolean;
    public system: boolean;
    public flags: number;
    public globalName: string | null;

    constructor(client: Client, data: UserData) {
        this.client = client;
        this.id = data.id;
        this.username = data.username;
        this.discriminator = data.discriminator;
        this.avatar = data.avatar || null;
        this.banner = data.banner || null;
        this.bot = !!data.bot;
        this.system = !!data.system;
        this.flags = data.flags || 0;
        this.globalName = (data as any).global_name || null;
    }

    get tag(): string {
        return `${this.username}#${this.discriminator}`;
    }

    get displayName(): string {
        return this.globalName || this.username;
    }

    get createdAt(): Date {
        const { getCreationDate } = require('../util');
        return getCreationDate(this.id);
    }

    avatarURL(options: { size?: number; format?: 'png' | 'jpeg' | 'webp' | 'gif' } = {}): string {
        if (!this.avatar) return getDefaultAvatarUrl(this.id);
        return getUserAvatarUrl(this.id, this.avatar, options);
    }

    defaultAvatarURL(): string {
        return getDefaultAvatarUrl(this.id);
    }

    displayAvatarURL(options: { size?: number; format?: 'png' | 'jpeg' | 'webp' | 'gif' } = {}): string {
        return this.avatarURL(options);
    }

    /** Send a DM to this user */
    async send(content: string | object): Promise<any> {
        // Create DM channel first
        const dmChannel = await this.client.rest.post<any>('/users/@me/channels', {
            recipient_id: this.id,
        });
        const body = typeof content === 'string' ? { content } : content;
        return this.client.rest.post(`/channels/${dmChannel.id}/messages`, body);
    }

    /** Fetch the full profile of this user */
    async fetchProfile(): Promise<any> {
        return this.client.rest.get(`/users/${this.id}/profile`);
    }

    toString(): string {
        return `<@${this.id}>`;
    }

    toJSON(): UserData {
        return {
            id: this.id,
            username: this.username,
            discriminator: this.discriminator,
            avatar: this.avatar || undefined,
            banner: this.banner || undefined,
            bot: this.bot,
            system: this.system,
            flags: this.flags,
        };
    }
}
