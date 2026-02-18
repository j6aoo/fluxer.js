export class SnowflakeUtil {
    public static readonly DISCORD_EPOCH = 1420070400000;

    /**
     * Converts a Date object or timestamp to a snowflake.
     * @param date The date to convert
     */
    public static dateToSnowflake(date: Date | number): string {
        const timestamp = typeof date === 'number' ? date : date.getTime();
        return ((BigInt(timestamp) - BigInt(this.DISCORD_EPOCH)) << 22n).toString();
    }

    /**
     * Converts a snowflake to a Date object.
     * @param snowflake The snowflake to convert
     */
    public static snowflakeToDate(snowflake: string): Date {
        return new Date(Number((BigInt(snowflake) >> 22n) + BigInt(this.DISCORD_EPOCH)));
    }
}
