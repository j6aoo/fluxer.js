import type { Client } from '../client';
import type { Guild } from './Guild';
import type { Role as RoleData, RoleTags } from '../types';
import { Base } from './Base';
import { Permissions } from '../util/Permissions';
import { Collection } from '../collections/Collection';

export interface RoleEditOptions {
    name?: string;
    color?: number;
    hoist?: boolean;
    icon?: string | null;
    unicode_emoji?: string | null;
    position?: number;
    permissions?: Permissions | bigint | string | number;
    mentionable?: boolean;
}

/**
 * Represents a role in a guild
 */
export class Role extends Base {
    public readonly guild!: Guild;
    public name!: string;
    public color!: number;
    public hoist!: boolean;
    public icon!: string | null;
    public unicodeEmoji!: string | null;
    public position!: number;
    public permissions!: Readonly<Permissions>;
    public managed!: boolean;
    public mentionable!: boolean;
    public tags!: RoleTags | null;

    constructor(client: Client, data: RoleData & { guild?: Guild }) {
        super(client);
        if (data.guild) {
            (this as any).guild = data.guild;
        }
        this._patch(data);
    }

    _patch(data: RoleData): void {
        this.name = data.name ?? 'new role';
        this.color = data.color ?? 0;
        this.hoist = data.hoist ?? false;
        this.icon = data.icon ?? null;
        this.unicodeEmoji = data.unicode_emoji ?? null;
        this.position = data.position ?? 0;
        this.permissions = Object.freeze(new Permissions(BigInt(data.permissions ?? 0)));
        this.managed = data.managed ?? false;
        this.mentionable = data.mentionable ?? false;
        this.tags = data.tags ?? null;
    }

    /**
     * The ID of the role
     */
    get id(): string {
        return this.tags?.bot_id ?? this.tags?.integration_id ?? `${this.guild.id}-${this.name}`;
    }

    /**
     * The hex color of the role
     */
    get hexColor(): string {
        return `#${this.color.toString(16).padStart(6, '0')}`;
    }

    /**
     * Whether this role is the @everyone role
     */
    get isEveryone(): boolean {
        return this.position === 0 && this.name === '@everyone';
    }

    /**
     * Members that have this role
     */
    get members(): Collection<string, any> {
        // TODO: Implement when GuildMemberManager is available
        return new Collection();
    }

    /**
     * Whether the role is editable by the client user
     */
    get editable(): boolean {
        if (this.managed) return false;
        // TODO: Check against client's highest role when GuildMemberManager is available
        return !this.isEveryone;
    }

    /**
     * Edit this role
     */
    async edit(options: RoleEditOptions, reason?: string): Promise<Role> {
        const data = await this.client.rest.patch<RoleData>(`/guilds/${this.guild.id}/roles/${this.id}`, {
            name: options.name,
            color: options.color,
            hoist: options.hoist,
            icon: options.icon,
            unicode_emoji: options.unicode_emoji,
            position: options.position,
            permissions: options.permissions !== undefined 
                ? String(options.permissions instanceof Permissions ? options.permissions.bitfield : BigInt(options.permissions))
                : undefined,
            mentionable: options.mentionable,
        }, { reason });
        
        this._patch(data);
        return this;
    }

    /**
     * Delete this role
     */
    async delete(reason?: string): Promise<void> {
        await this.client.rest.delete(`/guilds/${this.guild.id}/roles/${this.id}`, { reason });
        // Role will be removed from cache via Guild
    }

    /**
     * Set the position of this role
     */
    async setPosition(position: number, reason?: string): Promise<Role> {
        return this.edit({ position }, reason);
    }

    /**
     * Set the permissions of this role
     */
    async setPermissions(permissions: Permissions | bigint | string | number, reason?: string): Promise<Role> {
        return this.edit({ permissions }, reason);
    }

    /**
     * Compare this role's position to another role
     * @returns Negative if this role is lower, positive if higher, 0 if equal
     */
    comparePositionTo(role: Role): number {
        if (this.position === role.position) {
            return role.id.localeCompare(this.id);
        }
        return this.position - role.position;
    }

    /**
     * Mention string for this role
     */
    toString(): string {
        return `<@&${this.id}>`;
    }
}
