import { DataManager } from './DataManager';
import { MessageReaction } from '../structures/MessageReaction';
import { Collection } from '../collections/Collection';
import type { Message } from '../structures/Message';
import type { Client } from '../client';
import type { Reaction } from '../types';

export class ReactionManager extends DataManager<string, MessageReaction, string> {
    public message: Message;
    protected _holds = MessageReaction as any;

    constructor(client: Client, message: Message) {
        super(client);
        this.message = message;
    }

    /**
     * Internal method to add or update an object in the cache.
     */
    public override _add(data: Reaction, cache = true): MessageReaction {
        const emojiId = data.emoji.id ?? data.emoji.name!;
        const existing = this.cache.get(emojiId);

        if (existing) {
            existing._patch(data);
            return existing;
        }

        const entry = new MessageReaction(this.client, data, this.message);
        if (cache) this.cache.set(emojiId, entry);
        return entry;
    }

    /**
     * Fetch all reactions for the message
     */
    async fetch(): Promise<Collection<string, MessageReaction>> {
        // Discord API doesn't have a single endpoint to fetch all reactions with their counts
        // usually they are included in the message object. 
        // If we want the latest, we might need to fetch the message.
        const data = await this.client.rest.get<any>(`/channels/${this.message.channelId}/messages/${this.message.id}`);
        
        this.cache.clear();
        if (data.reactions) {
            for (const reactionData of data.reactions) {
                this._add(reactionData);
            }
        }
        return this.cache;
    }

    /**
     * Add a reaction to the message
     */
    async add(emoji: string): Promise<MessageReaction> {
        await this.message.react(emoji);
        // We don't get the full reaction object back, so we return what we have or a partial
        const emojiId = emoji.includes(':') ? emoji.split(':').pop()! : emoji;
        return this.cache.get(emojiId) || this._add({ 
            count: 1, 
            me: true, 
            emoji: { 
                id: emoji.includes(':') ? emojiId : null, 
                name: emoji.includes(':') ? emoji.split(':')[0] : emoji 
            } 
        });
    }

    /**
     * Remove all reactions from the message
     */
    async removeAll(): Promise<void> {
        await this.client.rest.delete(`/channels/${this.message.channelId}/messages/${this.message.id}/reactions`);
        this.cache.clear();
    }

    /**
     * Remove a specific emoji or user's reaction
     */
    async remove(emoji: string, userId?: string): Promise<void> {
        const encodedEmoji = encodeURIComponent(emoji);
        const path = `/channels/${this.message.channelId}/messages/${this.message.id}/reactions/${encodedEmoji}${userId ? `/${userId}` : ''}`;
        await this.client.rest.delete(path);
        
        if (!userId) {
            const emojiId = emoji.includes(':') ? emoji.split(':').pop()! : emoji;
            this.cache.delete(emojiId);
        }
    }
}
