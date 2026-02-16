import { Client } from '../client';
import { Message } from '../structures/Message';

export class ChannelManager {
    constructor(public client: Client) {}

    public async send(channelId: string, content: string | object) {
        const body = typeof content === 'string' ? { content } : content;
        const data = await this.client.rest.post<any>(`/channels/${channelId}/messages`, body);
        return new Message(this.client, data);
    }
}
