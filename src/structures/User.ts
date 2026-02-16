import { Client } from '../client';
import { User as UserData } from '../types';

export class User {
    public id: string;
    public username: string;
    public discriminator: string;
    public avatar: string | null;
    public bot: boolean;
    public system: boolean;

    constructor(public client: Client, data: UserData) {
        this.id = data.id;
        this.username = data.username;
        this.discriminator = data.discriminator;
        this.avatar = data.avatar || null;
        this.bot = !!data.bot;
        this.system = !!data.system;
    }

    get tag() {
        return `${this.username}#${this.discriminator}`;
    }

    toString() {
        return `<@${this.id}>`;
    }
}
