import type { Client } from '../client';
import { User as UserData } from '../types';
import { getUserAvatarUrl, getUserBannerUrl, getDefaultAvatarUrl, getCreationDate, ImageURLOptions } from '../util';

import { DMChannel } from './channels/DMChannel';
import { Message, MessagePayload } from './Message';

export interface UserProfile {
    [key: string]: any;
}

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
    public accentColor: number | null;

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
        this.accentColor = (data as any).accent_color || null;
    }

    get tag(): string {
        return `${this.username}#${this.discriminator}`;
    }

    get displayName(): string {
        return this.globalName || this.username;
    }

    get createdAt(): Date {
        return getCreationDate(this.id);
    }

    avatarURL(options: ImageURLOptions = {}): string | null {
        if (!this.avatar) return null;
        return getUserAvatarUrl(this.id, this.avatar, options);
    }

    bannerURL(options: ImageURLOptions = {}): string | null {
        if (!this.banner) return null;
        return getUserBannerUrl(this.id, this.banner, options);
    }

    defaultAvatarURL(): string {
        return getDefaultAvatarUrl(this.id);
    }

    displayAvatarURL(options: ImageURLOptions = {}): string {
        return this.avatarURL(options) || this.defaultAvatarURL();
    }

    /** Create a DM channel with this user */
    async createDM(): Promise<DMChannel> {
        // Check cache first to avoid unnecessary API calls
        const cached = this.client.channels.cache.find(
            ch => ch.type === 1 && (ch as DMChannel).recipient?.id === this.id
        );
        if (cached) return cached as DMChannel;

        const data = await this.client.rest.post<any>('/users/@me/channels', {
            recipient_id: this.id,
        });
        return new DMChannel(this.client, data);
    }

    /** Send a DM to this user */
    async send(message: string | MessagePayload): Promise<Message> {
        const dmChannel = await this.createDM();
        return dmChannel.send(message as any);
    }

    /** Fetch the full profile of this user */
    async fetchProfile(): Promise<UserProfile> {
        return this.client.rest.get<UserProfile>(`/users/${this.id}/profile`);
    }

    toString(): string {
        return `<@${this.id}>`;
    }

    toJSON(): UserData {
        return {
            id: this.id,
            username: this.username,
            discriminator: this.discriminator,
            avatar: this.avatar,
            banner: this.banner,
            bot: this.bot,
            system: this.system,
            mfa_enabled: false,
            accent_color: this.accentColor,
            locale: 'en-US',
            verified: false,
            email: null,
            flags: this.flags,
            premium_type: null,
            public_flags: this.flags,
        };
    }
}
