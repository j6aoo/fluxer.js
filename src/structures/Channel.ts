import { Client } from '../client';
import { Channel as ChannelData } from '../types';

export class Channel {
    public id: string;
    public name: string | null;
    public type: number;

    constructor(public client: Client, data: ChannelData) {
        this.id = data.id;
        this.name = data.name || null;
        this.type = data.type;
    }

    public async send(content: string | object) {
        return this.client.channels.send(this.id, content);
    }

    toString() {
        return `<#${this.id}>`;
    }
}
