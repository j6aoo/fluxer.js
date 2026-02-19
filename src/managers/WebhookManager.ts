import { BaseManager } from './BaseManager';
import { Webhook } from '../structures/Webhook';
import { Message } from '../structures/Message';
import type { Client } from '../client';
import type { WebhookData, Message as MessageData } from '../types';

export interface WebhookCreateOptions {
    name: string;
    avatar?: string;
}

export interface WebhookEditOptions {
    name?: string;
    avatar?: string;
    channel_id?: string;
}

export interface WebhookExecuteOptions {
    content?: string;
    username?: string;
    avatar_url?: string;
    embeds?: any[];
}

export class WebhookManager extends BaseManager {
    constructor(client: Client) {
        super(client);
    }

    /** Create a webhook for a channel */
    async create(channelId: string, options: WebhookCreateOptions): Promise<Webhook> {
        const data = await this.client.rest.post<WebhookData>(`/channels/${channelId}/webhooks`, options);
        return new Webhook(this.client, data);
    }

    /** Fetch a webhook by ID */
    async fetch(id: string): Promise<Webhook> {
        const data = await this.client.rest.get<WebhookData>(`/webhooks/${id}`);
        return new Webhook(this.client, data);
    }

    /** Fetch channel webhooks */
    async fetchChannelWebhooks(channelId: string): Promise<Webhook[]> {
        const data = await this.client.rest.get<WebhookData[]>(`/channels/${channelId}/webhooks`);
        return data.map(webhook => new Webhook(this.client, webhook));
    }

    /** Fetch guild webhooks */
    async fetchGuildWebhooks(guildId: string): Promise<Webhook[]> {
        const data = await this.client.rest.get<WebhookData[]>(`/guilds/${guildId}/webhooks`);
        return data.map(webhook => new Webhook(this.client, webhook));
    }

    /** Edit a webhook */
    async edit(id: string, options: WebhookEditOptions): Promise<Webhook> {
        const data = await this.client.rest.patch<WebhookData>(`/webhooks/${id}`, options);
        return new Webhook(this.client, data);
    }

    /** Delete a webhook */
    async delete(id: string): Promise<void> {
        await this.client.rest.delete(`/webhooks/${id}`);
    }

    /** Fetch a webhook with token (no authentication required) */
    async fetchWithToken(id: string, token: string): Promise<Webhook> {
        const data = await this.client.rest.get<WebhookData>(`/webhooks/${id}/${token}`);
        return new Webhook(this.client, data);
    }

    /** Edit a webhook with token */
    async editWithToken(id: string, token: string, options: Partial<WebhookEditOptions>): Promise<Webhook> {
        const data = await this.client.rest.patch<WebhookData>(`/webhooks/${id}/${token}`, options);
        return new Webhook(this.client, data);
    }

    /** Delete a webhook with token */
    async deleteWithToken(id: string, token: string): Promise<void> {
        await this.client.rest.delete(`/webhooks/${id}/${token}`);
    }

    /** Execute a webhook (send message via webhook) */
    async execute(webhookId: string, token: string, options: WebhookExecuteOptions, wait = false): Promise<Message | void> {
        const query = wait ? { wait: true } : undefined;
        const data = await this.client.rest.post<MessageData | void>(
            `/webhooks/${webhookId}/${token}`,
            options,
            { query },
        );
        if (wait && data) return new Message(this.client, data as MessageData);
    }

    async executeGithub(webhookId: string, token: string, payload: unknown): Promise<void> {
        await this.client.rest.post(`/webhooks/${webhookId}/${token}/github`, payload);
    }

    async executeSlack(webhookId: string, token: string, payload: unknown): Promise<void> {
        await this.client.rest.post(`/webhooks/${webhookId}/${token}/slack`, payload);
    }

    /** Edit a webhook message */
    async editMessage(webhookId: string, token: string, messageId: string, data: any): Promise<any> {
        return this.client.rest.patch(`/webhooks/${webhookId}/${token}/messages/${messageId}`, data);
    }

    /** Delete a webhook message */
    async deleteMessage(webhookId: string, token: string, messageId: string): Promise<void> {
        await this.client.rest.delete(`/webhooks/${webhookId}/${token}/messages/${messageId}`);
    }
}
