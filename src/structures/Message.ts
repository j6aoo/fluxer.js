import { Client } from '../client';
import { Message as MessageData } from '../types';
import { User } from './User';
import { Channel } from './Channel';

export class Message {
    public id: string;
    public content: string;
    public channelId: string;
    public author: User;
    public channel: Channel;

    constructor(public client: Client, data: MessageData) {
        this.id = data.id;
        this.content = data.content;
        this.channelId = data.channel_id;
        this.author = new User(client, data.author);
        this.channel = new Channel(client, { id: data.channel_id, type: 0 } as any);
    }

    public async reply(content: string | object) {
        if (typeof content === 'string') {
            content = { content, message_reference: { message_id: this.id } };
        } else {
            (content as any).message_reference = { message_id: this.id };
        }
        return this.channel.send(content);
    }
}
