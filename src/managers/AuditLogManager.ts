import { DataManager } from './DataManager';
import { AuditLogEntry } from '../structures/AuditLogEntry';
import type { Guild } from '../structures/Guild';
import type { Client } from '../client';
import { Collection } from '../collections/Collection';
import type { Snowflake, AuditLog as AuditLogData } from '../types';

export interface FetchAuditLogOptions {
    user_id?: Snowflake;
    action_type?: number;
    before?: Snowflake;
    limit?: number;
}

/**
 * Manages audit log entries for a guild
 */
export class AuditLogManager extends DataManager<string, AuditLogEntry, string> {
    public readonly guild: Guild;
    protected _holds = AuditLogEntry as unknown as new (client: Client, data: any, users?: Map<string, any>) => AuditLogEntry;

    constructor(guild: Guild) {
        super(guild.client);
        this.guild = guild;
    }

    /**
     * Fetch audit log entries from the API
     */
    async fetch(options: FetchAuditLogOptions = {}): Promise<{
        entries: Collection<string, AuditLogEntry>;
        users: Collection<string, any>;
        webhooks: Collection<string, any>;
        guildScheduledEvents: Collection<string, any>;
        threads: Collection<string, any>;
    }> {
        const query: Record<string, any> = {};
        if (options.user_id) query.user_id = options.user_id;
        if (options.action_type) query.action_type = options.action_type;
        if (options.before) query.before = options.before;
        if (options.limit) query.limit = options.limit;

        const data = await this.client.rest.get<AuditLogData>(`/guilds/${this.guild.id}/audit-logs`, query);
        
        // Create users map for executor resolution
        const usersMap = new Map<string, any>();
        for (const userData of data.users || []) {
            const user = this.client.users._add(userData);
            usersMap.set(user.id, user);
        }

        const entries = new Collection<string, AuditLogEntry>();
        for (const entryData of data.audit_log_entries) {
            const entry = new AuditLogEntry(this.client, entryData, usersMap);
            entries.set(entry.id, entry);
            this.cache.set(entry.id, entry);
        }

        const webhooks = new Collection<string, any>();
        for (const webhook of data.webhooks || []) {
            webhooks.set(webhook.id, webhook);
        }

        const guildScheduledEvents = new Collection<string, any>();
        for (const event of data.guild_scheduled_events || []) {
            guildScheduledEvents.set(event.id, event);
        }

        const threads = new Collection<string, any>();
        for (const thread of data.threads || []) {
            threads.set(thread.id, thread);
        }

        return {
            entries,
            users: new Collection(usersMap),
            webhooks,
            guildScheduledEvents,
            threads,
        };
    }
}
