import { describe, it, expect } from 'vitest';
import { BitField } from '../../../src/util/BitField';

class TestBitField extends BitField<string> {
  public static override FLAGS = {
    READ: 1n << 0n,
    WRITE: 1n << 1n,
    EXECUTE: 1n << 2n,
  };
}

describe('BitField', () => {
  it('should initialize with default bits', () => {
    const bf = new TestBitField();
    expect(bf.bitfield).toBe(0n);
  });

  it('should add flags', () => {
    const bf = new TestBitField();
    bf.add('READ', 'WRITE');
    expect(bf.has('READ')).toBe(true);
    expect(bf.has('WRITE')).toBe(true);
    expect(bf.has('EXECUTE')).toBe(false);
    expect(bf.bitfield).toBe(3n);
  });

  it('should remove flags', () => {
    const bf = new TestBitField(7n); // All flags
    bf.remove('WRITE');
    expect(bf.has('READ')).toBe(true);
    expect(bf.has('WRITE')).toBe(false);
    expect(bf.has('EXECUTE')).toBe(true);
  });

  it('should resolve various types', () => {
    expect(TestBitField.resolve('READ')).toBe(1n);
    expect(TestBitField.resolve(2n)).toBe(2n);
    expect(TestBitField.resolve(['READ', 'EXECUTE'])).toBe(5n);
  });

  it('should convert to array', () => {
    const bf = new TestBitField(5n);
    expect(bf.toArray()).toEqual(['READ', 'EXECUTE']);
  });
});
