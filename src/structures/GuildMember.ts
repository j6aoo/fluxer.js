import type { Client } from '../client';
import { GuildMember as GuildMemberData } from '../types';
import { User } from './User';

export class GuildMember {
    public readonly client: Client;
    public user: User | null;
    public nick: string | null;
    public avatar: string | null;
    public roles: string[];
    public joinedAt: Date;
    public premiumSince: Date | null;
    public deaf: boolean;
    public message_count?: number;
    public mute: boolean;
    public pending: boolean;
    public permissions: string | null;
    public communicationDisabledUntil: Date | null;
    public guildId: string;

    constructor(client: Client, data: GuildMemberData & { guild_id?: string }) {
        this.client = client;
        this.user = data.user ? new User(client, data.user) : null;
        this.nick = data.nick || null;
        this.avatar = data.avatar || null;
        this.roles = data.roles;
        this.joinedAt = new Date(data.joined_at);
        this.premiumSince = data.premium_since ? new Date(data.premium_since) : null;
        this.deaf = data.deaf;
        this.mute = data.mute;
        this.pending = !!data.pending;
        this.permissions = data.permissions || null;
        this.communicationDisabledUntil = data.communication_disabled_until
            ? new Date(data.communication_disabled_until)
            : null;
        this.guildId = (data as any).guild_id || '';
    }

    get displayName(): string {
        return this.nick || this.user?.displayName || 'Unknown';
    }

    get id(): string {
        return this.user?.id || '';
    }

    /** Kick this member from the guild */
    async kick(reason?: string): Promise<void> {
        await this.client.rest.delete(`/guilds/${this.guildId}/members/${this.id}`, { reason });
    }

    /** Ban this member from the guild */
    async ban(options: { delete_message_seconds?: number; reason?: string } = {}): Promise<void> {
        const { reason, ...body } = options;
        await this.client.rest.put(`/guilds/${this.guildId}/bans/${this.id}`, body, { reason });
    }

    /** Edit this member */
    async edit(data: Partial<{ nick: string; roles: string[]; mute: boolean; deaf: boolean; channel_id: string | null }>, reason?: string): Promise<GuildMember> {
        const updated = await this.client.rest.patch<GuildMemberData>(
            `/guilds/${this.guildId}/members/${this.id}`,
            data,
            { reason },
        );
        return new GuildMember(this.client, { ...updated, guild_id: this.guildId });
    }

    /** Add a role to this member */
    async addRole(roleId: string, reason?: string): Promise<void> {
        await this.client.rest.put(`/guilds/${this.guildId}/members/${this.id}/roles/${roleId}`, {}, { reason });
    }

    /** Remove a role from this member */
    async removeRole(roleId: string, reason?: string): Promise<void> {
        await this.client.rest.delete(`/guilds/${this.guildId}/members/${this.id}/roles/${roleId}`, { reason });
    }

    /** Timeout this member */
    async timeout(until: Date | null, reason?: string): Promise<GuildMember> {
        return this.edit({
            channel_id: null,
        }, reason);
    }

    toString(): string {
        return `<@${this.nick ? '!' : ''}${this.id}>`;
    }

    toJSON(): any {
        return {
            user: this.user?.toJSON(),
            nick: this.nick,
            roles: this.roles,
            joined_at: this.joinedAt.toISOString(),
            deaf: this.deaf,
            mute: this.mute,
            guild_id: this.guildId,
        };
    }
}
