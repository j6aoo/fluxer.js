import type { Client } from '../client';
import { GuildMember as GuildMemberData, Snowflake } from '../types';
import { User } from './User';
import { GuildMemberRoleManager } from './GuildMemberRoleManager';
import type { Guild } from './Guild';
import type { Presence } from './Presence';
import type { VoiceState } from './VoiceState';

export interface GuildMemberEditOptions {
    nick?: string | null;
    roles?: string[];
    mute?: boolean;
    deaf?: boolean;
    channelId?: string | null;
    communicationDisabledUntil?: string | null;
}

export interface BanOptions {
    deleteMessageSeconds?: number;
    reason?: string;
}

export class GuildMember {
    public readonly client: Client;
    public user: User | null;
    public nick: string | null;
    public avatar: string | null;
    public roles: GuildMemberRoleManager;
    public joinedAt: Date;
    public premiumSince: Date | null;
    public deaf: boolean;
    public message_count?: number;
    public mute: boolean;
    public pending: boolean;
    public permissions: string | null;
    public communicationDisabledUntil: Date | null;
    public guildId: string;
    /** @internal */
    public _roles: string[];

    /** The presence of this member */
    get presence(): Presence | null {
        return this.guild.presences.cache.get(this.id) || null;
    }

    /** The voice state of this member */
    get voice(): VoiceState | null {
        return this.guild.voiceStates.cache.get(this.id) || null;
    }

    constructor(client: Client, data: GuildMemberData & { guild_id?: string }) {
        this.client = client;
        this.user = data.user ? new User(client, data.user) : null;
        this.nick = data.nick || null;
        this.avatar = data.avatar || null;
        this._roles = data.roles;
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
        this.roles = new GuildMemberRoleManager(this);
    }

    /** The guild this member belongs to */
    get guild(): Guild {
        return this.client.guilds.cache.get(this.guildId)!;
    }

    /** Whether this member is manageable by the bot */
    get manageable(): boolean {
        if (this.id === this.guild.ownerId) return false;
        if (this.id === this.client.user?.id) return false;
        const me = this.guild.members.me;
        if (!me) return false;
        return me.roles.highest!.position > this.roles.highest!.position;
    }

    /** Whether this member is kickable by the bot */
    get kickable(): boolean {
        return this.manageable && (this.guild.members.me?.permissions as any /* TODO: check bits */);
    }

    /** Whether this member is bannable by the bot */
    get bannable(): boolean {
        return this.manageable;
    }

    get displayName(): string {
        return this.nick || this.user?.displayName || 'Unknown';
    }

    /** The hexadecimal color of the member's highest role */
    get displayHexColor(): string {
        const color = this.roles.color;
        return `#${color.toString(16).padStart(6, '0')}`;
    }

    get id(): string {
        return this.user?.id || '';
    }

    /** Kick this member from the guild */
    async kick(reason?: string): Promise<void> {
        await this.client.rest.delete(`/guilds/${this.guildId}/members/${this.id}`, { reason });
    }

    /** Ban this member from the guild */
    async ban(options: BanOptions = {}): Promise<void> {
        await this.client.rest.put(`/guilds/${this.guildId}/bans/${this.id}`, {
            delete_message_seconds: options.deleteMessageSeconds
        }, { reason: options.reason });
    }

    /** Edit this member */
    async edit(data: GuildMemberEditOptions, reason?: string): Promise<GuildMember> {
        const updated = await this.client.rest.patch<GuildMemberData>(
            `/guilds/${this.guildId}/members/${this.id}`,
            {
                nick: data.nick,
                roles: data.roles,
                mute: data.mute,
                deaf: data.deaf,
                channel_id: data.channelId,
                communication_disabled_until: data.communicationDisabledUntil
            },
            { reason },
        );
        return this._patch(updated);
    }

    /** Set the nickname of this member */
    async setNickname(nick: string | null, reason?: string): Promise<GuildMember> {
        return this.edit({ nick }, reason);
    }

    /** Fetch this member from the API */
    async fetch(): Promise<GuildMember> {
        return this.guild.members.fetch(this.id) as Promise<GuildMember>;
    }

    /** Timeout this member */
    async timeout(until: Date | number | null, reason?: string): Promise<GuildMember> {
        const communicationDisabledUntil = until instanceof Date 
            ? until.toISOString() 
            : typeof until === 'number' 
                ? new Date(until).toISOString() 
                : null;

        return this.edit({
            communicationDisabledUntil
        }, reason);
    }

    /** @internal */
    _patch(data: GuildMemberData): GuildMember {
        if (data.nick !== undefined) this.nick = data.nick || null;
        if (data.avatar !== undefined) this.avatar = data.avatar || null;
        if (data.roles !== undefined) {
            this._roles = data.roles;
            this.roles._patch(this._roles);
        }
        if (data.deaf !== undefined) this.deaf = data.deaf;
        if (data.mute !== undefined) this.mute = data.mute;
        if (data.pending !== undefined) this.pending = !!data.pending;
        if (data.communication_disabled_until !== undefined) {
            this.communicationDisabledUntil = data.communication_disabled_until
                ? new Date(data.communication_disabled_until)
                : null;
        }
        return this;
    }

    toString(): string {
        return `<@${this.id}>`;
    }

    toJSON(): any {
        return {
            user: this.user?.toJSON(),
            nick: this.nick,
            roles: this._roles,
            joined_at: this.joinedAt.toISOString(),
            deaf: this.deaf,
            mute: this.mute,
            guild_id: this.guildId,
        };
    }
}
