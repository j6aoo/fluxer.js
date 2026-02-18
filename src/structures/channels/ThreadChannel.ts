import type { Client } from '../../client';
import { TextChannel } from './TextChannel';
import { Channel as ChannelData } from '../../types';

export class ThreadChannel extends TextChannel {
    public ownerId: string | null = null;
    public parentId: string | null = null;
    public messageCount: number = 0;
    public memberCount: number = 0;
    public archived: boolean = false;
    public locked: boolean = false;

    constructor(client: Client, data: ChannelData) {
        super(client, data);
        this._patch(data);
    }

    _patch(data: ChannelData): void {
        super._patch(data);
        if (data.owner_id !== undefined) this.ownerId = data.owner_id || null;
        if (data.parent_id !== undefined) this.parentId = data.parent_id || null;
        if (data.message_count !== undefined) this.messageCount = data.message_count || 0;
        if (data.member_count !== undefined) this.memberCount = data.member_count || 0;
        
        if (data.thread_metadata) {
            this.archived = !!data.thread_metadata.archived;
            this.locked = !!data.thread_metadata.locked;
        }
    }

    /** Join this thread */
    async join(): Promise<void> {
        await this.client.rest.post(`/channels/${this.id}/thread-members/@me`);
    }

    /** Leave this thread */
    async leave(): Promise<void> {
        await this.client.rest.delete(`/channels/${this.id}/thread-members/@me`);
    }

    /** Delete this thread */
    async delete(reason?: string): Promise<void> {
        await this.client.rest.delete(`/channels/${this.id}`, { reason });
    }

    toJSON(): any {
        return {
            ...super.toJSON(),
            owner_id: this.ownerId,
            parent_id: this.parentId,
            message_count: this.messageCount,
            member_count: this.memberCount,
            archived: this.archived,
            locked: this.locked,
        };
    }
}
