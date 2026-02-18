import { Base } from './Base';
import { ReactionEmoji } from './ReactionEmoji';
import { Collection } from '../collections/Collection';
import { User } from './User';
import type { Message } from './Message';
import type { Client } from '../client';
import type { Reaction } from '../types';

export class MessageReaction extends Base {
    public message: Message;
    public emoji: ReactionEmoji;
    public count: number;
    public me: boolean;

    constructor(client: Client, data: Reaction, message: Message) {
        super(client);
        this.message = message;
        this.emoji = new ReactionEmoji(data.emoji);
        this.count = data.count;
        this.me = data.me;
    }

    _patch(data: any): void {
        if (data.count !== undefined) this.count = data.count;
        if (data.me !== undefined) this.me = data.me;
    }

    /**
     * Fetch users who reacted with this emoji
     */
    async fetchUsers(options: { limit?: number; after?: string } = {}): Promise<Collection<string, User>> {
        const query = new URLSearchParams();
        if (options.limit) query.append('limit', options.limit.toString());
        if (options.after) query.append('after', options.after);

        const data = await this.client.rest.get<any[]>(
            `/channels/${this.message.channelId}/messages/${this.message.id}/reactions/${this.emoji.identifier}${query.toString() ? `?${query.toString()}` : ''}`
        );

        const users = new Collection<string, User>();
        for (const userData of data) {
            const user = this.client.users._add(userData);
            users.set(user.id, user);
        }
        return users;
    }

    /**
     * React to the message with this emoji
     */
    async react(): Promise<MessageReaction> {
        await this.message.react(this.emoji.identifier);
        return this;
    }

    /**
     * Remove a user's reaction
     */
    async remove(user?: string | User): Promise<void> {
        const userId = typeof user === 'string' ? user : user?.id ?? '@me';
        await this.client.rest.delete(
            `/channels/${this.message.channelId}/messages/${this.message.id}/reactions/${this.emoji.identifier}/${userId}`
        );
    }

    /**
     * Remove all reactions for this emoji
     */
    async removeAll(): Promise<void> {
        await this.client.rest.delete(
            `/channels/${this.message.channelId}/messages/${this.message.id}/reactions/${this.emoji.identifier}`
        );
    }
}
