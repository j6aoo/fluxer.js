import { DataManager } from './DataManager';
import { VoiceState } from '../structures/VoiceState';
import type { Guild } from '../structures/Guild';

export class VoiceStateManager extends DataManager<string, VoiceState, typeof VoiceState> {
    public readonly guild: Guild;
    protected _holds = VoiceState;

    constructor(guild: Guild) {
        super(guild.client);
        this.guild = guild;
    }

    /**
     * @internal
     */
    _add(data: any, cache = true): VoiceState {
        return super._add(data, cache, { id: data.user_id });
    }

    /**
     * Fetches a voice state for a user
     * @param userId The ID of the user to fetch the voice state for
     */
    async fetch(userId?: string): Promise<VoiceState | any> {
        if (userId) {
            const existing = this.cache.get(userId);
            if (existing) return existing;
            throw new Error('VoiceState not found in cache.');
        }
        return this.cache;
    }
}
