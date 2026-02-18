import type { Client } from '../client';
import type { Message, Guild, GuildMember, GuildBan, Snowflake } from '../types';
import type { Collection } from '../collections/Collection';

export interface FetchAllOptions {
    limit?: number;
    before?: Snowflake;
    after?: Snowflake;
    around?: Snowflake;
}

export class Pagination {
    /**
     * Fetches all messages from a channel.
     */
    public static async fetchAllMessages(channel: { id: Snowflake, client: Client }, options: FetchAllOptions = {}): Promise<Message[]> {
        const messages: Message[] = [];
        let lastId = options.before;

        while (true) {
            const fetched: Message[] = await channel.client.rest.get(`/channels/${channel.id}/messages`, {
                limit: 100,
                before: lastId,
                after: options.after,
            });

            if (fetched.length === 0) break;
            messages.push(...fetched);
            lastId = fetched[fetched.length - 1].id;

            if (options.limit && messages.length >= options.limit) {
                return messages.slice(0, options.limit);
            }
            if (fetched.length < 100) break;
        }

        return messages;
    }

    /**
     * Fetches all guilds for the client.
     */
    public static async fetchAllGuilds(client: Client, options: FetchAllOptions = {}): Promise<Guild[]> {
        const guilds: Guild[] = [];
        let lastId = options.after;

        while (true) {
            const fetched: Guild[] = await client.rest.get('/users/@me/guilds', {
                limit: 100,
                after: lastId,
                before: options.before,
            });

            if (fetched.length === 0) break;
            guilds.push(...fetched);
            lastId = fetched[fetched.length - 1].id;

            if (options.limit && guilds.length >= options.limit) {
                return guilds.slice(0, options.limit);
            }
            if (fetched.length < 100) break;
        }

        return guilds;
    }

    /**
     * Fetches all members from a guild.
     */
    public static async fetchAllMembers(guild: { id: Snowflake, client: Client }, options: FetchAllOptions = {}): Promise<GuildMember[]> {
        const members: GuildMember[] = [];
        let lastId = options.after || '0';

        while (true) {
            const fetched: GuildMember[] = await guild.client.rest.get(`/guilds/${guild.id}/members`, {
                limit: 1000,
                after: lastId,
            });

            if (fetched.length === 0) break;
            members.push(...fetched);
            lastId = (fetched[fetched.length - 1].user as any).id;

            if (options.limit && members.length >= options.limit) {
                return members.slice(0, options.limit);
            }
            if (fetched.length < 1000) break;
        }

        return members;
    }

    /**
     * Fetches all bans from a guild.
     */
    public static async fetchAllBans(guild: { id: Snowflake, client: Client }, options: FetchAllOptions = {}): Promise<GuildBan[]> {
        const bans: GuildBan[] = [];
        let lastId = options.after;

        while (true) {
            const fetched: GuildBan[] = await guild.client.rest.get(`/guilds/${guild.id}/bans`, {
                limit: 1000,
                after: lastId,
                before: options.before,
            });

            if (fetched.length === 0) break;
            bans.push(...fetched);
            lastId = fetched[fetched.length - 1].user.id;

            if (options.limit && bans.length >= options.limit) {
                return bans.slice(0, options.limit);
            }
            if (fetched.length < 1000) break;
        }

        return bans;
    }
}
