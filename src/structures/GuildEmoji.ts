import { Base } from './Base';
import { Collection } from '../collections/Collection';
import type { Client } from '../client';
import type { Emoji as EmojiData, Snowflake, User as UserData, GuildEmojiEditOptions } from '../types';
import type { Guild } from './Guild';
import { User } from './User';
import { GuildEmojiRoleManager } from './GuildEmojiRoleManager';
import { getEmojiUrl } from '../util';

export class GuildEmoji extends Base {
    public readonly id: Snowflake;
    public name: string | null;
    public animated: boolean;
    public author: User | null;
    public roles: GuildEmojiRoleManager;
    public managed: boolean;
    public available: boolean;
    public requireColons: boolean;
    public readonly guild: Guild;

    constructor(client: Client, data: EmojiData, guild: Guild) {
        super(client);
        this.id = data.id!;
        this.guild = guild;
        this.name = data.name || null;
        this.animated = !!data.animated;
        this.managed = !!data.managed;
        this.available = !!data.available;
        this.requireColons = !!data.require_colons;
        this.author = data.user ? new User(client, data.user) : null;
        this.roles = new GuildEmojiRoleManager(this);
        
        if (data.roles) {
            for (const roleId of data.roles) {
                this.roles.cache.set(roleId, roleId);
            }
        }
    }

    _patch(data: EmojiData): void {
        if (data.name !== undefined) this.name = data.name;
        if (data.animated !== undefined) this.animated = data.animated;
        if (data.managed !== undefined) this.managed = data.managed;
        if (data.available !== undefined) this.available = data.available;
        if (data.require_colons !== undefined) this.requireColons = data.require_colons;
        if (data.user !== undefined) this.author = new User(this.client, data.user);
        if (data.roles !== undefined) {
            this.roles.cache.clear();
            for (const roleId of data.roles) {
                this.roles.cache.set(roleId, roleId);
            }
        }
    }

    get url(): string {
        return getEmojiUrl(this.id, { animated: this.animated });
    }

    get identifier(): string {
        if (this.id) return `${this.animated ? 'a:' : ''}${this.name}:${this.id}`;
        return encodeURIComponent(this.name!);
    }

    _addRole(roleId: Snowflake): void {
        this.roles.cache.set(roleId, roleId);
    }

    _removeRole(roleId: Snowflake): void {
        this.roles.cache.delete(roleId);
    }

    async edit(options: GuildEmojiEditOptions): Promise<GuildEmoji> {
        const { reason, ...data } = options;
        const updated = await this.client.rest.patch<EmojiData>(`/guilds/${this.guild.id}/emojis/${this.id}`, data, { reason });
        this._patch(updated);
        return this;
    }

    async setName(name: string, reason?: string): Promise<GuildEmoji> {
        return this.edit({ name, reason });
    }

    async delete(reason?: string): Promise<void> {
        await this.client.rest.delete(`/guilds/${this.guild.id}/emojis/${this.id}`, { reason });
    }

    async fetchAuthor(): Promise<User> {
        const data = await this.client.rest.get<EmojiData>(`/guilds/${this.guild.id}/emojis/${this.id}`);
        this._patch(data);
        return this.author!;
    }

    toString(): string {
        return `<${this.animated ? 'a' : ''}:${this.name}:${this.id}>`;
    }
}
