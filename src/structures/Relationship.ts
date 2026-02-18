import { Base } from './Base';
import type { Client } from '../client';
import type { RelationshipData } from '../types';
import { User } from './User';

export class Relationship extends Base {
    public readonly id: string;
    public type: number;
    public user: User;
    public createdAt: Date | null = null;

    constructor(client: Client, data: RelationshipData) {
        super(client);
        this.id = data.id;
        this.user = new User(client, data.user);
        this.type = data.type;
        this._patch(data);
    }

    _patch(data: RelationshipData): void {
        if (data.type !== undefined) this.type = data.type;
        if (data.user !== undefined) this.user = new User(this.client, data.user);
        if (data.created_at !== undefined) {
            this.createdAt = data.created_at ? new Date(data.created_at) : null;
        }
    }
}
