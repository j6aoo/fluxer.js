import { Client } from '../client';
import { User } from '../structures/User';

export class UserManager {
    constructor(public client: Client) {}

    public async fetch(userId: string) {
        const data = await this.client.rest.get<any>(`/users/${userId}`);
        return new User(this.client, data);
    }
}
