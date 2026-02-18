import { BitField } from "./BitField";

export type UserFlagsString = keyof typeof UserFlagsBits;

/**
 * Numeric user flags.
 */
export const UserFlagsBits = {
  Staff: 1n << 0n,
  Partner: 1n << 1n,
  HypeSquad: 1n << 2n,
  BugHunterLevel1: 1n << 3n,
  HypeSquadOnlineHouse1: 1n << 6n,
  HypeSquadOnlineHouse2: 1n << 7n,
  HypeSquadOnlineHouse3: 1n << 8n,
  PremiumEarlySupporter: 1n << 9n,
  TeamPseudoUser: 1n << 10n,
  BugHunterLevel2: 1n << 14n,
  VerifiedBot: 1n << 16n,
  VerifiedDeveloper: 1n << 17n,
  CertifiedModerator: 1n << 18n,
  BotHTTPInteractions: 1n << 19n,
  ActiveDeveloper: 1n << 22n,
} as const;

/**
 * Data structure that makes it easy to interact with user flags.
 */
export class UserFlags extends BitField<UserFlagsString> {
  public static override FLAGS = UserFlagsBits;
}
