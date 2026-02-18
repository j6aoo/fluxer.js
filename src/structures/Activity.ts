import { Base } from './Base';
import type { Client } from '../client';
import type { Snowflake } from '../types';

export interface ActivityTimestamps {
    start?: number;
    end?: number;
}

export interface ActivityEmoji {
    name: string;
    id?: Snowflake;
    animated?: boolean;
}

export interface ActivityParty {
    id?: string;
    size?: [current_size: number, max_size: number];
}

export interface ActivityAssets {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
}

export interface ActivityButtons {
    label: string;
    url: string;
}

export enum ActivityType {
    Playing = 0,
    Streaming = 1,
    Listening = 2,
    Watching = 3,
    Custom = 4,
    Competing = 5,
}

export class Activity extends Base {
    public name: string;
    public type: ActivityType;
    public url: string | null;
    public createdAt: number;
    public timestamps: ActivityTimestamps | null;
    public applicationId: Snowflake | null;
    public details: string | null;
    public state: string | null;
    public emoji: ActivityEmoji | null;
    public party: ActivityParty | null;
    public assets: ActivityAssets | null;
    public buttons: ActivityButtons[] | null;

    constructor(client: Client, data: any) {
        super(client);
        this.name = data.name;
        this.type = data.type;
        this.url = data.url || null;
        this.createdAt = data.created_at;
        this.timestamps = data.timestamps || null;
        this.applicationId = data.application_id || null;
        this.details = data.details || null;
        this.state = data.state || null;
        this.emoji = data.emoji || null;
        this.party = data.party || null;
        this.assets = data.assets || null;
        this.buttons = data.buttons || null;
    }

    get typeString(): string {
        return ActivityType[this.type] || 'Unknown';
    }

    /** @internal */
    _patch(data: any): void {
        this.name = data.name;
        this.type = data.type;
        this.url = data.url || null;
        this.createdAt = data.created_at;
        this.timestamps = data.timestamps || null;
        this.applicationId = data.application_id || null;
        this.details = data.details || null;
        this.state = data.state || null;
        this.emoji = data.emoji || null;
        this.party = data.party || null;
        this.assets = data.assets || null;
        this.buttons = data.buttons || null;
    }
}
