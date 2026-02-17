import type { Client } from '../client';
import { Guild as GuildData, Role as RoleData, Emoji as EmojiData, Channel as ChannelData } from '../types';
import { Channel } from './Channel';
import { Collection } from '../collections/Collection';
import { getGuildIconUrl, getGuildBannerUrl } from '../util';

export class Guild {
    public readonly client: Client;
    public readonly id: string;
    public name: string;
    public icon: string | null;
    public splash: string | null;
    public banner: string | null;
    public ownerId: string;
    public description: string | null;
    public features: string[];
    public vanityUrlCode: string | null;
    public premiumTier: number;
    public premiumSubscriptionCount: number;
    public preferredLocale: string;
    public memberCount: number;
    public roles: Collection<string, RoleData>;
    public emojis: Collection<string, EmojiData>;
    public channels: Collection<string, Channel>;

    constructor(client: Client, data: GuildData & { channels?: ChannelData[]; member_count?: number }) {
        this.client = client;
        this.id = data.id;
        this.name = data.name;
        this.icon = data.icon || null;
        this.splash = data.splash || null;
        this.banner = data.banner || null;
        this.ownerId = data.owner_id;
        this.description = data.description || null;
        this.features = data.features || [];
        this.vanityUrlCode = data.vanity_url_code || null;
        this.premiumTier = data.premium_tier;
        this.premiumSubscriptionCount = data.premium_subscription_count || 0;
        this.preferredLocale = data.preferred_locale;
        this.memberCount = (data as any).member_count || 0;

        this.roles = new Collection();
        if (data.roles) {
            for (const role of data.roles) {
                this.roles.set(role.id, role);
            }
        }

        this.emojis = new Collection();
        if (data.emojis) {
            for (const emoji of data.emojis) {
                if (emoji.id) this.emojis.set(emoji.id, emoji);
            }
        }

        this.channels = new Collection();
        if ((data as any).channels) {
            for (const ch of (data as any).channels) {
                this.channels.set(ch.id, new Channel(client, ch));
            }
        }
    }

    get createdAt(): Date {
        const { getCreationDate } = require('../util');
        return getCreationDate(this.id);
    }

    iconURL(options: { size?: number; format?: 'png' | 'jpeg' | 'webp' | 'gif' } = {}): string | null {
        if (!this.icon) return null;
        return getGuildIconUrl(this.id, this.icon, options);
    }

    bannerURL(options: { size?: number; format?: 'png' | 'jpeg' | 'webp' | 'gif' } = {}): string | null {
        if (!this.banner) return null;
        return getGuildBannerUrl(this.id, this.banner, options);
    }

    /** Fetch full guild data from API */
    async fetch(): Promise<Guild> {
        const data = await this.client.rest.get<GuildData>(`/guilds/${this.id}`);
        return new Guild(this.client, data);
    }

    /** Edit guild settings */
    async edit(data: Partial<{ name: string; icon: string; banner: string; description: string }>, reason?: string): Promise<Guild> {
        const updated = await this.client.rest.patch<GuildData>(`/guilds/${this.id}`, data, { reason });
        return new Guild(this.client, updated);
    }

    /** Leave this guild */
    async leave(): Promise<void> {
        await this.client.rest.delete(`/users/@me/guilds/${this.id}`);
    }

    /** Fetch guild channels */
    async fetchChannels(): Promise<Channel[]> {
        const data = await this.client.rest.get<ChannelData[]>(`/guilds/${this.id}/channels`);
        return data.map(ch => new Channel(this.client, ch));
    }

    /** Create a channel in this guild */
    async createChannel(data: { name: string; type?: number; topic?: string; parent_id?: string; nsfw?: boolean; position?: number }, reason?: string): Promise<Channel> {
        const channelData = await this.client.rest.post<ChannelData>(`/guilds/${this.id}/channels`, data, { reason });
        return new Channel(this.client, channelData);
    }

    /** Fetch guild roles */
    async fetchRoles(): Promise<RoleData[]> {
        return this.client.rest.get<RoleData[]>(`/guilds/${this.id}/roles`);
    }

    /** Create a role */
    async createRole(data: Partial<{ name: string; permissions: string; color: number; hoist: boolean; mentionable: boolean }> = {}, reason?: string): Promise<RoleData> {
        return this.client.rest.post<RoleData>(`/guilds/${this.id}/roles`, data, { reason });
    }

    /** Delete a role */
    async deleteRole(roleId: string, reason?: string): Promise<void> {
        await this.client.rest.delete(`/guilds/${this.id}/roles/${roleId}`, { reason });
    }

    /** Fetch guild members */
    async fetchMembers(options: { limit?: number; after?: string } = {}): Promise<any[]> {
        const query: Record<string, any> = {};
        if (options.limit) query.limit = options.limit;
        if (options.after) query.after = options.after;
        return this.client.rest.get(`/guilds/${this.id}/members`, query);
    }

    /** Fetch a single member */
    async fetchMember(userId: string): Promise<any> {
        return this.client.rest.get(`/guilds/${this.id}/members/${userId}`);
    }

    /** Kick a member */
    async kickMember(userId: string, reason?: string): Promise<void> {
        await this.client.rest.delete(`/guilds/${this.id}/members/${userId}`, { reason });
    }

    /** Ban a member */
    async banMember(userId: string, options: { delete_message_seconds?: number; reason?: string } = {}): Promise<void> {
        const { reason, ...body } = options;
        await this.client.rest.put(`/guilds/${this.id}/bans/${userId}`, body, { reason });
    }

    /** Unban a user */
    async unbanUser(userId: string, reason?: string): Promise<void> {
        await this.client.rest.delete(`/guilds/${this.id}/bans/${userId}`, { reason });
    }

    /** Fetch guild bans */
    async fetchBans(): Promise<any[]> {
        return this.client.rest.get(`/guilds/${this.id}/bans`);
    }

    /** Fetch guild invites */
    async fetchInvites(): Promise<any[]> {
        return this.client.rest.get(`/guilds/${this.id}/invites`);
    }

    /** Fetch guild webhooks */
    async fetchWebhooks(): Promise<any[]> {
        return this.client.rest.get(`/guilds/${this.id}/webhooks`);
    }

    /** Get guild emoji list */
    async fetchEmojis(): Promise<EmojiData[]> {
        return this.client.rest.get<EmojiData[]>(`/guilds/${this.id}/emojis`);
    }

    toString(): string {
        return this.name;
    }

    toJSON(): any {
        return {
            id: this.id,
            name: this.name,
            icon: this.icon,
            banner: this.banner,
            owner_id: this.ownerId,
            description: this.description,
            features: this.features,
        };
    }
}
