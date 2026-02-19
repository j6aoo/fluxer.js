import type { Client } from '../client';
import { Base } from './Base';
import type { AuditLogEntry as AuditLogEntryData, AuditLogChange, AuditLogOptions, User as UserData } from '../types';

/**
 * Represents an audit log entry
 */
export class AuditLogEntry extends Base {
    public readonly id: string;
    public actionType: number = 0;
    public userId: string | null = null;
    public targetId: string | null = null;
    public changes: AuditLogChange[] = [];
    public options: AuditLogOptions | null = null;
    public reason: string | null = null;
    public executor: any | null = null;
    public target: any | null = null;

    constructor(client: Client, data: AuditLogEntryData, users: Map<string, UserData> = new Map()) {
        super(client);
        this.id = data.id;
        this._patch(data, users);
    }

    _patch(data: AuditLogEntryData, users: Map<string, UserData> = new Map()): void {
        this.actionType = data.action_type;
        this.userId = data.user_id ?? null;
        this.targetId = data.target_id ?? null;
        this.changes = data.changes ?? [];
        this.options = data.options ?? null;
        this.reason = data.reason ?? null;
        
        // Set executor from users map
        if (data.user_id && users.has(data.user_id)) {
            this.executor = this.client.users._add(users.get(data.user_id)!);
        } else {
            this.executor = null;
        }
        
        this.target = null; // Will be set later if target is cached
    }

    /**
     * The timestamp of when this entry was created
     */
    get createdAt(): Date {
        const { getCreationDate } = require('../util');
        return getCreationDate(this.id);
    }

    /**
     * The timestamp of when this entry was created (in milliseconds)
     */
    get createdTimestamp(): number {
        return this.createdAt.getTime();
    }

    /**
     * The action type as a readable string
     */
    get action(): string {
        const { AuditLogEvent } = require('../types');
        const actions: Record<number, string> = {
            [AuditLogEvent.GuildUpdate]: 'Guild Update',
            [AuditLogEvent.ChannelCreate]: 'Channel Create',
            [AuditLogEvent.ChannelUpdate]: 'Channel Update',
            [AuditLogEvent.ChannelDelete]: 'Channel Delete',
            [AuditLogEvent.ChannelOverwriteCreate]: 'Channel Overwrite Create',
            [AuditLogEvent.ChannelOverwriteUpdate]: 'Channel Overwrite Update',
            [AuditLogEvent.ChannelOverwriteDelete]: 'Channel Overwrite Delete',
            [AuditLogEvent.MemberKick]: 'Member Kick',
            [AuditLogEvent.MemberPrune]: 'Member Prune',
            [AuditLogEvent.MemberBanAdd]: 'Member Ban Add',
            [AuditLogEvent.MemberBanRemove]: 'Member Ban Remove',
            [AuditLogEvent.MemberUpdate]: 'Member Update',
            [AuditLogEvent.MemberRoleUpdate]: 'Member Role Update',
            [AuditLogEvent.MemberMove]: 'Member Move',
            [AuditLogEvent.MemberDisconnect]: 'Member Disconnect',
            [AuditLogEvent.BotAdd]: 'Bot Add',
            [AuditLogEvent.RoleCreate]: 'Role Create',
            [AuditLogEvent.RoleUpdate]: 'Role Update',
            [AuditLogEvent.RoleDelete]: 'Role Delete',
            [AuditLogEvent.GuildScheduledEventCreate]: 'Guild Scheduled Event Create',
            [AuditLogEvent.GuildScheduledEventUpdate]: 'Guild Scheduled Event Update',
            [AuditLogEvent.GuildScheduledEventDelete]: 'Guild Scheduled Event Delete',
            [AuditLogEvent.ThreadCreate]: 'Thread Create',
            [AuditLogEvent.ThreadUpdate]: 'Thread Update',
            [AuditLogEvent.ThreadDelete]: 'Thread Delete',
            [AuditLogEvent.ApplicationCommandPermissionUpdate]: 'Application Command Permission Update',
            [AuditLogEvent.SoundboardSoundCreate]: 'Soundboard Sound Create',
            [AuditLogEvent.SoundboardSoundUpdate]: 'Soundboard Sound Update',
            [AuditLogEvent.SoundboardSoundDelete]: 'Soundboard Sound Delete',
            [AuditLogEvent.AutoModerationRuleCreate]: 'Auto Moderation Rule Create',
            [AuditLogEvent.AutoModerationRuleUpdate]: 'Auto Moderation Rule Update',
            [AuditLogEvent.AutoModerationRuleDelete]: 'Auto Moderation Rule Delete',
            [AuditLogEvent.AutoModerationBlockMessage]: 'Auto Moderation Block Message',
            [AuditLogEvent.AutoModerationFlagToChannel]: 'Auto Moderation Flag To Channel',
            [AuditLogEvent.AutoModerationUserCommunicationDisabled]: 'Auto Moderation User Communication Disabled',
            [AuditLogEvent.CreatorMonetizationRequestCreated]: 'Creator Monetization Request Created',
            [AuditLogEvent.CreatorMonetizationTermsAccepted]: 'Creator Monetization Terms Accepted',
            [AuditLogEvent.OnboardingPromptCreate]: 'Onboarding Prompt Create',
            [AuditLogEvent.OnboardingPromptUpdate]: 'Onboarding Prompt Update',
            [AuditLogEvent.OnboardingPromptDelete]: 'Onboarding Prompt Delete',
            [AuditLogEvent.OnboardingCreate]: 'Onboarding Create',
            [AuditLogEvent.OnboardingUpdate]: 'Onboarding Update',
            [AuditLogEvent.HomeSettingsCreate]: 'Home Settings Create',
            [AuditLogEvent.HomeSettingsUpdate]: 'Home Settings Update',
        };
        return actions[this.actionType] || `Unknown Action (${this.actionType})`;
    }

    /**
     * Fetch the executor user
     */
    async fetchExecutor(): Promise<any | null> {
        if (!this.userId) return null;
        return this.client.users.fetch(this.userId);
    }

    toJSON(): any {
        return {
            id: this.id,
            action_type: this.actionType,
            user_id: this.userId,
            target_id: this.targetId,
            changes: this.changes,
            options: this.options,
            reason: this.reason,
        };
    }
}
