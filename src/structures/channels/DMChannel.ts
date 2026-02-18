import type { Client } from '../../client';
import { BaseChannel } from './BaseChannel';
import { Channel as ChannelData, Message as MessageData, User as UserData } from '../../types';
import { MessageManager } from '../../managers/MessageManager';
import { User } from '../User';
import { Message } from '../Message';
import type { MessageCreateData } from '../Message';

export class DMChannel extends BaseChannel {
    public recipient: User | null = null;
    public lastMessageId: string | null = null;
    public readonly messages: MessageManager;

    constructor(client: Client, data: ChannelData) {
        super(client, data);
        this.messages = new MessageManager(client, this.id);
        this._patch(data);
    }

    _patch(data: ChannelData): void {
        super._patch(data);
        if (data.recipients && data.recipients.length > 0) {
            this.recipient = this.client.users._add(data.recipients[0]);
        }
        if (data.last_message_id !== undefined) this.lastMessageId = data.last_message_id || null;
    }

    /** Send a message to this DM channel */
    async send(content: string | MessageCreateData): Promise<Message> {
        const body = typeof content === 'string' ? { content } : content;
        const data = await this.client.rest.post<MessageData>(`/channels/${this.id}/messages`, body);
        return new Message(this.client, data);
    }

    toJSON(): any {
        return {
            ...super.toJSON(),
            recipient_id: this.recipient?.id,
            last_message_id: this.lastMessageId,
        };
    }
}
