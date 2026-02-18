import { BitField } from "./BitField";

export type MessageFlagsString = keyof typeof MessageFlagsBits;

/**
 * Numeric message flags.
 */
export const MessageFlagsBits = {
  Crossposted: 1n << 0n,
  IsCrosspost: 1n << 1n,
  SuppressEmbeds: 1n << 2n,
  SourceMessageDeleted: 1n << 3n,
  Urgent: 1n << 4n,
  HasThread: 1n << 5n,
  Ephemeral: 1n << 6n,
  Loading: 1n << 7n,
  FailedToMentionSomeRolesInThread: 1n << 8n,
  SuppressNotifications: 1n << 12n,
  IsVoiceMessage: 1n << 13n,
} as const;

/**
 * Data structure that makes it easy to interact with message flags.
 */
export class MessageFlags extends BitField<MessageFlagsString> {
  public static override FLAGS = MessageFlagsBits;
}
