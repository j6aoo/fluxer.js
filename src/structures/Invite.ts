import { Base } from './Base';
import type { Client } from '../client';
import { User } from './User';
import { InviteGuild } from './InviteGuild';
import type { Guild } from './Guild';
import type { Channel } from './Channel';

export class Invite extends Base {
    public code: string;
    public guild: Guild | InviteGuild | null = null;
    public channel: Channel | null = null;
    public inviter: User | null = null;
    public targetUser: User | null = null;
    public targetType: number | null = null;
    public targetApplication: any | null = null;
    public approximatePresenceCount: number | null = null;
    public approximateMemberCount: number | null = null;
    public expiresAt: Date | null = null;
    public uses: number | null = null;
    public maxUses: number | null = null;
    public maxAge: number | null = null;
    public temporary: boolean | null = null;
    public createdAt: Date | null = null;

    constructor(client: Client, data: any) {
        super(client);
        this.code = data.code;
        this._patch(data);
    }

    _patch(data: any): void {
        if (data.code !== undefined) this.code = data.code;
        
        if (data.guild !== undefined) {
            if (data.guild.id && this.client.guilds.cache.has(data.guild.id)) {
                this.guild = this.client.guilds.cache.get(data.guild.id)!;
            } else {
                this.guild = new InviteGuild(data.guild);
            }
        }

        if (data.channel !== undefined) {
            this.channel = this.client.channels.cache.get(data.channel.id) || null;
        }

        if (data.inviter !== undefined) {
            this.inviter = this.client.users._add(data.inviter);
        }

        if (data.target_user !== undefined) {
            this.targetUser = this.client.users._add(data.target_user);
        }

        if (data.target_type !== undefined) this.targetType = data.target_type;
        if (data.target_application !== undefined) this.targetApplication = data.target_application;
        if (data.approximate_presence_count !== undefined) this.approximatePresenceCount = data.approximate_presence_count;
        if (data.approximate_member_count !== undefined) this.approximateMemberCount = data.approximate_member_count;
        if (data.expires_at !== undefined) this.expiresAt = data.expires_at ? new Date(data.expires_at) : null;
        if (data.uses !== undefined) this.uses = data.uses;
        if (data.max_uses !== undefined) this.maxUses = data.max_uses;
        if (data.max_age !== undefined) this.maxAge = data.max_age;
        if (data.temporary !== undefined) this.temporary = data.temporary;
        if (data.created_at !== undefined) this.createdAt = data.created_at ? new Date(data.created_at) : null;
    }

    get url(): string {
        return `https://discord.gg/${this.code}`;
    }

    async delete(reason?: string): Promise<Invite> {
        await this.client.rest.delete(`/invites/${this.code}`, { reason });
        return this;
    }

    async fetch(): Promise<Invite> {
        const data = await this.client.rest.get(`/invites/${this.code}`, {
            with_counts: true,
            with_expiration: true
        });
        this._patch(data);
        return this;
    }

    toString(): string {
        return this.url;
    }
}
