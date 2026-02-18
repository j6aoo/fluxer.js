import { CachedManager } from './CachedManager';
import type { Client } from '../client';
import type { Guild } from '../structures/Guild';
import { Role } from '../structures/Role';
import { Collection } from '../collections/Collection';

export interface RoleCreateOptions {
    name?: string;
    color?: number;
    hoist?: boolean;
    icon?: string;
    unicodeEmoji?: string;
    position?: number;
    permissions?: bigint | string | number;
    mentionable?: boolean;
}

export interface RolePositionOptions {
    id: string;
    position: number;
}

/**
 * Manages roles for a guild
 */
export class RoleManager extends CachedManager<string, Role, string> {
    public readonly guild: Guild;
    protected _holds = Role as unknown as new (client: Client, data: any) => Role;

    constructor(guild: Guild) {
        super(guild.client);
        this.guild = guild;
    }

    /**
     * The highest role of the client user in this guild
     */
    get highest(): Role | null {
        // TODO: Implement when GuildMemberManager is available
        // For now, return the highest position role
        let highest: Role | null = null;
        for (const role of this.cache.values()) {
            if (!highest || role.position > highest.position) {
                highest = role;
            }
        }
        return highest;
    }

    /**
     * The @everyone role of this guild
     */
    get everyone(): Role | null {
        return this.cache.find(role => role.position === 0 && role.name === '@everyone') ?? null;
    }

    /**
     * Fetch a role from the API
     */
    async fetch(roleId: string, force = false): Promise<Role | null> {
        if (!force) {
            const cached = this.cache.get(roleId);
            if (cached) return cached;
        }

        try {
            const data = await this.client.rest.get<any>(`/guilds/${this.guild.id}/roles/${roleId}`);
            return this._add(data, true);
        } catch {
            return null;
        }
    }

    /**
     * Fetch all roles from the API
     */
    async fetchAll(force = false): Promise<Collection<string, Role>> {
        if (!force && this.cache.size > 0) {
            return this.cache;
        }

        const data = await this.client.rest.get<any[]>(`/guilds/${this.guild.id}/roles`);
        const roles = new Collection<string, Role>();
        
        for (const roleData of data) {
            const role = this._add(roleData, true);
            roles.set(role.id, role);
        }

        return roles;
    }

    /**
     * Create a new role
     */
    async create(options: RoleCreateOptions = {}, reason?: string): Promise<Role> {
        const data = await this.client.rest.post<any>(`/guilds/${this.guild.id}/roles`, {
            name: options.name,
            color: options.color,
            hoist: options.hoist,
            icon: options.icon,
            unicode_emoji: options.unicodeEmoji,
            position: options.position,
            permissions: options.permissions !== undefined ? String(options.permissions) : undefined,
            mentionable: options.mentionable,
        }, { reason });

        return this._add(data, true);
    }

    /**
     * Delete a role
     */
    async delete(roleId: string, reason?: string): Promise<void> {
        await this.client.rest.delete(`/guilds/${this.guild.id}/roles/${roleId}`, { reason });
        this._remove(roleId);
    }

    /**
     * Set the position of roles
     */
    async setPositions(positions: RolePositionOptions[], reason?: string): Promise<Collection<string, Role>> {
        const data = await this.client.rest.patch<any[]>(`/guilds/${this.guild.id}/roles`, positions, { reason });
        
        const roles = new Collection<string, Role>();
        for (const roleData of data) {
            const role = this._add(roleData, true);
            roles.set(role.id, role);
        }

        return roles;
    }

    /**
     * Internal method to add or update a role
     */
    _add(data: any, cache = true): Role {
        const existing = this.cache.get(data.id);
        if (existing) {
            if (cache) existing._patch(data);
            return existing;
        }

        const entry = new Role(this.client, { ...data, guild: this.guild });
        if (cache) this.cache.set(entry.id, entry);
        return entry;
    }

    /**
     * Internal method to remove a role
     */
    _remove(id: string): void {
        this.cache.delete(id);
    }
}
