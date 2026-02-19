import { DataManager } from './DataManager';
import { GuildMember } from '../structures/GuildMember';
import type { Guild } from '../structures/Guild';
import type { Client } from '../client';
import { Collection } from '../collections/Collection';
import type { Snowflake, GuildMember as GuildMemberData, User as UserData } from '../types';
import { PaginatedManager, PaginatedFetchOptions } from '../structures/Managers/PaginatedManager';

export interface FetchMemberOptions extends PaginatedFetchOptions {
    user?: string | string[];
    withPresences?: boolean;
}

export interface BanOptions {
    deleteMessageSeconds?: number;
    reason?: string;
}

/**
 * Manages members of a guild
 */
export class GuildMemberManager extends PaginatedManager<Snowflake, GuildMember, Snowflake> {
    public readonly guild: Guild;
    protected _holds = GuildMember as unknown as new (client: Client, data: any) => GuildMember;

    constructor(guild: Guild) {
        super(guild.client);
        this.guild = guild;
    }

    /** The member object of the bot user in this guild */
    get me(): GuildMember | null {
        return this.cache.get(this.client.user?.id || '') || null;
    }

    /** The member with the highest role in the guild */
    get highest(): GuildMember | null {
        return this.cache.sorted((a, b) => (b.roles.highest?.position || 0) - (a.roles.highest?.position || 0)).first() || null;
    }

    /**
     * Fetch multiple members from the API
     */
    async fetchMany(options: PaginatedFetchOptions = {}): Promise<Collection<Snowflake, GuildMember>> {
        const query: any = {};
        if (options.limit) query.limit = options.limit;
        if (options.after) query.after = options.after;

        const data = await this.client.rest.get<GuildMemberData[]>(`/guilds/${this.guild.id}/members`, query);
        const members = new Collection<Snowflake, GuildMember>();
        for (const memberData of data) {
            const member = this._add(memberData, options.cache ?? true);
            members.set(member.id, member);
        }
        return members;
    }

    /**
     * Fetch member(s) from the API
     */
    async fetch(options?: Snowflake | FetchMemberOptions): Promise<GuildMember | Collection<Snowflake, GuildMember>> {
        if (typeof options === 'string') {
            const data = await this.client.rest.get<GuildMemberData>(`/guilds/${this.guild.id}/members/${options}`);
            return this._add(data, true, { id: options });
        }

        const query: any = {};
        if (options?.limit) query.limit = options.limit;
        if (options?.after) query.after = options.after;
        if (options?.user) {
            if (Array.isArray(options.user)) {
                const members = new Collection<Snowflake, GuildMember>();
                for (const id of options.user) {
                    const m = await this.fetch(id) as GuildMember;
                    members.set(m.id, m);
                }
                return members;
            }
            query.query = options.user;
        }

        const data = await this.client.rest.get<GuildMemberData[]>(`/guilds/${this.guild.id}/members`, query);
        const members = new Collection<Snowflake, GuildMember>();
        for (const memberData of data) {
            const member = this._add(memberData, options?.cache ?? true);
            members.set(member.id, member);
        }
        return members;
    }

    /** Add a user to the guild */
    async add(user: Snowflake | UserData, options: { accessToken: string; nick?: string; roles?: string[]; mute?: boolean; deaf?: boolean }): Promise<GuildMember> {
        const id = typeof user === 'string' ? user : user.id;
        const data = await this.client.rest.put<GuildMemberData>(`/guilds/${this.guild.id}/members/${id}`, {
            access_token: options.accessToken,
            nick: options.nick,
            roles: options.roles,
            mute: options.mute,
            deaf: options.deaf
        });
        return this._add(data, true);
    }

    /** Kick a member */
    async kick(user: Snowflake | GuildMember, reason?: string): Promise<void> {
        const id = typeof user === 'string' ? user : user.id;
        await this.client.rest.delete(`/guilds/${this.guild.id}/members/${id}`, { reason });
    }

    /** Ban a user */
    async ban(user: Snowflake | GuildMember, options: BanOptions = {}): Promise<void> {
        const id = typeof user === 'string' ? user : user.id;
        await this.guild.bans._add({
            user: typeof user === 'string' ? { id: user } : user.user,
            reason: options.reason ?? null
        });
        await this.client.rest.put(`/guilds/${this.guild.id}/bans/${id}`, {
            delete_message_seconds: options.deleteMessageSeconds
        }, { reason: options.reason });
    }

    /** Unban a user */
    async unban(user: Snowflake, reason?: string): Promise<void> {
        await this.client.rest.delete(`/guilds/${this.guild.id}/bans/${user}`, { reason });
    }

    /** Prune members */
    async prune(options: { days?: number; computePruneCount?: boolean; includeRoles?: string[]; reason?: string } = {}): Promise<number | null> {
        const data = await this.client.rest.post<{ pruned: number | null }>(`/guilds/${this.guild.id}/prune`, {
            days: options.days,
            compute_prune_count: options.computePruneCount,
            include_roles: options.includeRoles
        }, { reason: options.reason });
        return data.pruned;
    }

    /** Search for members */
    async search(options: { query: string; limit?: number }): Promise<Collection<Snowflake, GuildMember>> {
        const data = await this.client.rest.post<GuildMemberData[]>(`/guilds/${this.guild.id}/members-search`, {
            query: options.query,
            limit: options.limit
        });
        const members = new Collection<Snowflake, GuildMember>();
        for (const memberData of data) {
            const member = this._add(memberData, true);
            members.set(member.id, member);
        }
        return members;
    }

    /** Internal method to add/update a member */
    _add(data: any, cache = true, { id }: { id?: Snowflake } = {}): GuildMember {
        const memberId = id ?? data.user?.id;
        const existing = this.cache.get(memberId);
        if (existing) {
            if (cache) existing._patch(data);
            return existing;
        }

        const entry = new GuildMember(this.client, { ...data, guild_id: this.guild.id });
        if (cache) this.cache.set(memberId, entry);
        return entry;
    }
}
