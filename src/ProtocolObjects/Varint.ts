import { IProtocolObject } from './';

export interface IVarint extends IProtocolObject {
  head: number | null;
  body: Buffer;
  value: bigint;
}

export class Varint implements IVarint {
  public static MAX_VARINT: bigint = 0xfffffffffffffffen;

  public head: number | null;
  public body: Buffer;

  constructor (num: bigint) {
    if (num < 0xfd) {
      this.head = null;
      this.body = Buffer.alloc(1);
      this.body.writeUInt8(Number(num), 0);
    } else if (num <= 0xffff) {
      this.head = 0xfd;
      this.body = Buffer.alloc(2);
      this.body.writeUInt16BE(Number(num), 0);
    } else if (num <= 0xffffffff) {
      this.head = 0xfe;
      this.body = Buffer.alloc(4);
      this.body.writeUInt32BE(Number(num), 0);
    } else if (num <= Varint.MAX_VARINT) {
      this.head = 0xff;
      this.body = Buffer.alloc(8);
      this.body.writeBigUInt64BE(num, 0);
    } else {
      throw new Error('Number given exceeded MAX_VARINT');
    }
  }

  public get length (): number {
    return this.head ? this.body.length + 1 : this.body.length;
  }

  public get value (): bigint {
    if (!this.head) {
      return BigInt(this.body[0]);
    } else if (this.head === 0xfd) {
      return BigInt(this.body.readUInt16BE(0));
    } else if (this.head === 0xfe) {
      return BigInt(this.body.readUInt32BE(0));
    } else if (this.head === 0xff) {
      return this.body.readBigUInt64BE(0);
    } else {
      throw new Error('FATAL: Error while getting value');
    }
  }

  public serialize (): Buffer {
    if (!this.head) {
      return this.body;
    }
    const headBuffer = Buffer.from([this.head]);
    return Buffer.concat([headBuffer, this.body], this.length);
  }

  public static deserialize (bytes: Buffer): (IVarint | Buffer)[] {
    const firstByte = bytes[0];
    if (firstByte < 0xfd) {
      const result: IVarint[] = [new Varint(BigInt(firstByte))];
      Varint.pushLeftovers(bytes, result, 1);
      return result;
    } else if (firstByte === 0xfd) {
      const result: IVarint[] = [
        new Varint(BigInt(bytes.readUInt16BE(1)))
      ];
      Varint.pushLeftovers(bytes, result, 3);
      return result;
    } else if (firstByte === 0xfe) {
      const result: IVarint[] = [
        new Varint(BigInt(bytes.readUInt32BE(1))),
      ];
      Varint.pushLeftovers(bytes, result, 5);
      return result;
    } else if (firstByte === 0xff) {
      const result: IVarint[] = [
        new Varint(bytes.readBigUInt64BE(1))
      ];
      Varint.pushLeftovers(bytes, result, 9);
      return result;
    } else {
      throw new Error('This should absolutely never happen');
    }
  }

  private static pushLeftovers (
    bytes: Buffer,
    result: (IVarint | Buffer)[],
    offset: number ): void {
    const leftovers = bytes.slice(offset);
    if (leftovers.length > 0) {
      result.push(leftovers);
    }
  }
}
