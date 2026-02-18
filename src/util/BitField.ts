export type BitFieldResolvable =
  | bigint
  | number
  | string
  | BitFieldResolvable[]
  | BitField<string>;

/**
 * Data structure that makes it easy to interact with a bitfield.
 */
export abstract class BitField<S extends string> {
  /**
   * The flags of the bitfield.
   */
  public static FLAGS: Record<string, bigint> = {};

  /**
   * The bitfield's value.
   */
  public bitfield: bigint;

  constructor(bits: BitFieldResolvable = 0n) {
    this.bitfield = (this.constructor as typeof BitField).resolve(bits);
  }

  /**
   * Checks if the bitfield has a specific flag.
   */
  public has(bit: BitFieldResolvable): boolean {
    const resolved = (this.constructor as typeof BitField).resolve(bit);
    return (this.bitfield & resolved) === resolved;
  }

  /**
   * Adds flags to the bitfield.
   */
  public add(...bits: BitFieldResolvable[]): this {
    let total = 0n;
    for (const bit of bits) {
      total |= (this.constructor as typeof BitField).resolve(bit);
    }
    this.bitfield |= total;
    return this;
  }

  /**
   * Removes flags from the bitfield.
   */
  public remove(...bits: BitFieldResolvable[]): this {
    let total = 0n;
    for (const bit of bits) {
      total |= (this.constructor as typeof BitField).resolve(bit);
    }
    this.bitfield &= ~total;
    return this;
  }

  /**
   * Freezes the bitfield, making it immutable.
   */
  public freeze(): Readonly<this> {
    return Object.freeze(this);
  }

  /**
   * Converts the bitfield to an array of flags.
   */
  public toArray(): S[] {
    const flags = (this.constructor as typeof BitField).FLAGS;
    return Object.keys(flags).filter((key) => this.has(flags[key])) as S[];
  }

  /**
   * Resolves a bitfield resolvable into a bigint.
   */
  public static resolve(bit: BitFieldResolvable): bigint {
    const FLAGS = this.FLAGS;
    if (typeof bit === "bigint") return bit;
    if (typeof bit === "number") return BigInt(bit);
    if (typeof bit === "string") {
      if (FLAGS[bit] !== undefined) return FLAGS[bit];
      if (!isNaN(Number(bit))) return BigInt(bit);
    }
    if (Array.isArray(bit)) {
      return bit
        .map((b) => this.resolve(b))
        .reduce((prev, curr) => prev | curr, 0n);
    }
    if (bit instanceof BitField) return bit.bitfield;

    throw new Error(`RangeError [BITFIELD_INVALID]: Invalid bitfield resolvable: ${bit}`);
  }

  /**
   * Returns the primitive value of the bitfield.
   */
  public valueOf(): bigint {
    return this.bitfield;
  }

  /**
   * Returns a string representation of the bitfield.
   */
  public toString(): string {
    return this.bitfield.toString();
  }

  /**
   * Custom inspect for Node.js.
   */
  public [Symbol.for("nodejs.util.inspect.custom")]() {
    return `${this.constructor.name} { bitfield: ${this.bitfield}n }`;
  }
}
