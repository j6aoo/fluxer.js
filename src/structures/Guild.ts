import type { Client } from '../client';
import { Guild as GuildData, Role as RoleData, Emoji as EmojiData, Channel as ChannelData, Snowflake } from '../types';
import { createChannel } from './Channel';
import { Collection } from '../collections/Collection';
import { getGuildIconUrl, getGuildBannerUrl, ImageURLOptions } from '../util';
import { GuildMemberManager } from '../managers/GuildMemberManager';
import { RoleManager } from '../managers/RoleManager';
import { ChannelManager } from '../managers/ChannelManager';
import { GuildEmojiManager } from '../managers/GuildEmojiManager';
import { GuildBanManager } from '../managers/GuildBanManager';
import { PresenceManager } from '../managers/PresenceManager';
import { VoiceStateManager } from '../managers/VoiceStateManager';
import { AuditLogManager } from '../managers/AuditLogManager';
import { InviteManager } from '../managers/InviteManager';
import { BaseChannel } from './channels';
import { Invite } from './Invite';
import type { WebhookData as Webhook } from '../types';

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
    public roles: RoleManager;
    public emojis: GuildEmojiManager;
    public channels: ChannelManager;
    public members: GuildMemberManager;
    public bans: GuildBanManager;
    public presences: PresenceManager;
    public voiceStates: VoiceStateManager;
    public auditLogs: AuditLogManager;
    public readonly invites: InviteManager;


    constructor(client: Client, data: GuildData & { channels?: ChannelData[]; member_count?: number }) {
        if (!data || !data.id) {
            throw new Error('Guild data is required and must have an id');
        }
        this.client = client;
        this.id = data.id;
        this.invites = new InviteManager(client);

        this.name = data.name || 'Unknown Guild';
        this.icon = data.icon || null;
        this.splash = data.splash || null;
        this.banner = data.banner || null;
        this.ownerId = data.owner_id || '';
        this.description = data.description || null;
        this.features = data.features || [];
        this.vanityUrlCode = data.vanity_url_code || null;
        this.premiumTier = data.premium_tier ?? 0;
        this.premiumSubscriptionCount = data.premium_subscription_count || 0;
        this.preferredLocale = data.preferred_locale || 'en-US';
        this.memberCount = (data as any).member_count || 0;

        this.roles = new RoleManager(this);
        if (data.roles) {
            for (const role of data.roles) {
                this.roles._add(role);
            }
        }

        this.members = new GuildMemberManager(this);
        this.bans = new GuildBanManager(this);
        this.presences = new PresenceManager(this);
        this.voiceStates = new VoiceStateManager(this);
        this.auditLogs = new AuditLogManager(this);

        this.emojis = new GuildEmojiManager(this as any);
        if (data.emojis) {
            for (const emoji of data.emojis) {
                this.emojis._add(emoji);
            }
        }

        this.channels = new ChannelManager(client);
        if ((data as any).channels) {
            for (const ch of (data as any).channels) {
                this.channels.cache.set(ch.id, createChannel(client, ch));
            }
        }
    }

    get createdAt(): Date {
        const { getCreationDate } = require('../util');
        return getCreationDate(this.id);
    }

    iconURL(options: ImageURLOptions = {}): string | null {
        if (!this.icon) return null;
        return getGuildIconUrl(this.id, this.icon, options);
    }

    bannerURL(options: ImageURLOptions = {}): string | null {
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

    /** Delete this guild */
    async delete(password: string): Promise<void> {
        await this.client.rest.post(`/guilds/${this.id}/delete`, { password });
    }

    /** Acknowledge this guild */
    async ack(): Promise<void> {
        await this.client.rest.post(`/guilds/${this.id}/ack`);
    }

    /** Fetch guild channels */
    async fetchChannels(): Promise<BaseChannel[]> {
        const data = await this.client.rest.get<ChannelData[]>(`/guilds/${this.id}/channels`);
        return data.map(ch => createChannel(this.client, ch));
    }

    /** Create a channel in this guild */
    async createChannel(data: { name: string; type?: number; topic?: string; parent_id?: string; nsfw?: boolean; position?: number }, reason?: string): Promise<BaseChannel> {
        const channelData = await this.client.rest.post<ChannelData>(`/guilds/${this.id}/channels`, data, { reason });
        return createChannel(this.client, channelData);
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
    async fetchInvites(): Promise<Invite[]> {
        const data = await this.client.rest.get<any[]>(`/guilds/${this.id}/invites`);
        return data.map(inviteData => new Invite(this.client, inviteData));
    }

    /** Fetch guild webhooks */
    async fetchWebhooks(): Promise<Webhook[]> {
        return this.client.rest.get<Webhook[]>(`/guilds/${this.id}/webhooks`);
    }

    /** Get guild emoji list */
    async fetchEmojis(): Promise<EmojiData[]> {
        return this.client.rest.get<EmojiData[]>(`/guilds/${this.id}/emojis`);
    }

    /** Fetch vanity URL info */
    async fetchVanityUrl(): Promise<{ code: string | null; uses: number }> {
        return this.client.rest.get<{ code: string | null; uses: number }>(`/guilds/${this.id}/vanity-url`);
    }

    /** Reorder channels in the guild */
    async setChannelPositions(positions: { id: string; position: number; lock_permissions?: boolean; parent_id?: string }[], reason?: string): Promise<ChannelData[]> {
        return this.client.rest.patch<ChannelData[]>(`/guilds/${this.id}/channels`, positions, { reason });
    }

    /** Fetch the current bot member in this guild */
    async fetchMe(): Promise<any> {
        return this.client.rest.get(`/guilds/${this.id}/members/@me`);
    }

    /** Edit the current bot member in this guild */
    async editMe(data: { nick?: string | null }, reason?: string): Promise<any> {
        return this.client.rest.patch(`/guilds/${this.id}/members/@me`, data, { reason });
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
