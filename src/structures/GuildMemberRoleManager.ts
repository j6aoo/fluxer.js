import { Collection } from '../collections/Collection';
import type { Guild } from './Guild';
import type { GuildMember } from './GuildMember';
import type { Role } from './Role';
import { Snowflake } from '../types';

export class GuildMemberRoleManager {
    public readonly guild: Guild;
    public readonly member: GuildMember;
    public cache: Collection<Snowflake, Role>;

    constructor(member: GuildMember) {
        this.guild = member.guild;
        this.member = member;
        this.cache = new Collection();
        
        this._patch(member._roles);
    }

    /** The highest role of this member */
    get highest(): Role | null {
        return this.cache.sorted((a, b) => b.position - a.position).first() || null;
    }

    /** The color of the member (from the highest role with a color) */
    get color(): number {
        const role = this.cache.sorted((a, b) => b.position - a.position).find(r => r.color !== 0);
        return role?.color || 0;
    }

    /** The hoist role of the member */
    get hoist(): Role | null {
        return this.cache.sorted((a, b) => b.position - a.position).find(r => r.hoist) || null;
    }

    /** The role that gives this member Nitro Boost status, if any */
    get premiumSinceRole(): Role | null {
        return this.cache.find(r => r.tags?.premium_subscriber === null) || null;
    }

    /** Add a role to the member */
    async add(role: string | Role, reason?: string): Promise<void> {
        const id = typeof role === 'string' ? role : role.id;
        await this.member.client.rest.put(`/guilds/${this.guild.id}/members/${this.member.id}/roles/${id}`, {}, { reason });
    }

    /** Remove a role from the member */
    async remove(role: string | Role, reason?: string): Promise<void> {
        const id = typeof role === 'string' ? role : role.id;
        await this.member.client.rest.delete(`/guilds/${this.guild.id}/members/${this.member.id}/roles/${id}`, { reason });
    }

    /** Set the roles for the member */
    async set(roles: (string | Role)[], reason?: string): Promise<void> {
        const roleIds = roles.map(r => typeof r === 'string' ? r : r.id);
        await this.member.edit({ roles: roleIds }, reason);
    }

    /** Internal method to patch the roles cache */
    _patch(roleIds: string[]): void {
        this.cache.clear();
        for (const id of roleIds) {
            const role = this.guild.roles.cache.get(id);
            if (role) this.cache.set(id, role);
        }
    }
}
