import type { Client } from '../client';

export interface WebhookData {
    id: string;
    type: number;
    guild_id?: string;
    channel_id: string;
    name: string;
    avatar: string | null;
    token?: string;
    url?: string;
}

export interface WebhookExecuteOptions {
    content?: string;
    username?: string;
    avatar_url?: string;
    embeds?: any[];
    wait?: boolean;
}

export class WebhookManager {
    public readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    /** Fetch a webhook by ID */
    async fetch(webhookId: string): Promise<WebhookData> {
        return this.client.rest.get<WebhookData>(`/webhooks/${webhookId}`);
    }

    /** Create a webhook for a channel */
    async create(channelId: string, data: { name: string; avatar?: string }): Promise<WebhookData> {
        return this.client.rest.post<WebhookData>(`/channels/${channelId}/webhooks`, data);
    }

    /** Edit a webhook */
    async edit(webhookId: string, data: Partial<{ name: string; avatar: string; channel_id: string }>, reason?: string): Promise<WebhookData> {
        return this.client.rest.patch<WebhookData>(`/webhooks/${webhookId}`, data, { reason });
    }

    /** Delete a webhook */
    async delete(webhookId: string, reason?: string): Promise<void> {
        await this.client.rest.delete(`/webhooks/${webhookId}`, { reason });
    }

    /** Execute a webhook (send message via webhook) */
    async execute(webhookId: string, token: string, options: WebhookExecuteOptions): Promise<any> {
        const query: Record<string, any> = {};
        if (options.wait) query.wait = true;

        const { wait, ...body } = options;
        return this.client.rest.post(`/webhooks/${webhookId}/${token}`, body, { query });
    }

    /** Edit a webhook message */
    async editMessage(webhookId: string, token: string, messageId: string, data: any): Promise<any> {
        return this.client.rest.patch(`/webhooks/${webhookId}/${token}/messages/${messageId}`, data);
    }

    /** Delete a webhook message */
    async deleteMessage(webhookId: string, token: string, messageId: string): Promise<void> {
        await this.client.rest.delete(`/webhooks/${webhookId}/${token}/messages/${messageId}`);
    }

    /** Fetch channel webhooks */
    async fetchChannelWebhooks(channelId: string): Promise<WebhookData[]> {
        return this.client.rest.get<WebhookData[]>(`/channels/${channelId}/webhooks`);
    }

    /** Fetch guild webhooks */
    async fetchGuildWebhooks(guildId: string): Promise<WebhookData[]> {
        return this.client.rest.get<WebhookData[]>(`/guilds/${guildId}/webhooks`);
    }
}
