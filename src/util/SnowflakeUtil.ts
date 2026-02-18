export const FLUXER_EPOCH = 1420070400000n;

export class SnowflakeUtil {
    static timestampFrom(snowflake: string): number {
        const timestamp = (BigInt(snowflake) >> 22n) + FLUXER_EPOCH;
        return Number(timestamp);
    }

    static dateFrom(snowflake: string): Date {
        return new Date(SnowflakeUtil.timestampFrom(snowflake));
    }

    static fromTimestamp(timestamp: number): string {
        return ((BigInt(timestamp) - FLUXER_EPOCH) << 22n).toString();
    }

    static isValid(snowflake: string): boolean {
        if (!/^[0-9]+$/.test(snowflake)) return false;
        try {
            const value = BigInt(snowflake);
            if (value <= 0n) return false;
            const timestamp = (value >> 22n) + FLUXER_EPOCH;
            return timestamp > 0n;
        } catch {
            return false;
        }
    }

    static deconstruct(snowflake: string): {
        timestamp: number;
        workerId: number;
        processId: number;
        increment: number;
    } {
        const value = BigInt(snowflake);
        return {
            timestamp: Number((value >> 22n) + FLUXER_EPOCH),
            workerId: Number((value >> 17n) & 0x1fn),
            processId: Number((value >> 12n) & 0x1fn),
            increment: Number(value & 0xfffn),
        };
    }
}
