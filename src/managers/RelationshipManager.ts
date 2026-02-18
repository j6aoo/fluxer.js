import { BaseManager } from './BaseManager';
import { Relationship } from '../structures/Relationship';
import { RelationshipType } from '../consts';
import type { Client } from '../client';
import type { RelationshipData } from '../types';

export class RelationshipManager extends BaseManager {
    constructor(client: Client) {
        super(client);
    }

    async fetch(): Promise<Relationship[]> {
        const data = await this.client.rest.get<RelationshipData[]>('/users/@me/relationships');
        return data.map(entry => new Relationship(this.client, entry));
    }

    async add(userId: string): Promise<void> {
        await this.client.rest.put(`/users/@me/relationships/${userId}`, {
            type: RelationshipType.Friend,
        });
    }

    async addByTag(username: string, discriminator: string): Promise<void> {
        await this.client.rest.post('/users/@me/relationships', {
            username,
            discriminator,
        });
    }

    async remove(userId: string): Promise<void> {
        await this.client.rest.delete(`/users/@me/relationships/${userId}`);
    }

    async block(userId: string): Promise<void> {
        await this.client.rest.put(`/users/@me/relationships/${userId}`, {
            type: RelationshipType.Blocked,
        });
    }

    async unblock(userId: string): Promise<void> {
        await this.client.rest.delete(`/users/@me/relationships/${userId}`);
    }

    async updateNickname(userId: string, nickname: string): Promise<void> {
        await this.client.rest.patch(`/users/@me/relationships/${userId}`, {
            nickname,
        });
    }
}
