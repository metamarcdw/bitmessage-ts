import { IProtocolObject } from './';

export interface IVarint extends IProtocolObject {
  head: number | null;
  body: Buffer;
  length: number;
  value: bigint;
}

export class Varint implements IVarint {
  public static MAX_VARINT: bigint = 0xfffffffffffffffen;

  public head: number | null;
  public body: Buffer;

  public static deserialize = Varint.prototype.deserialize.bind(null);

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
      throw new RangeError('Number given exceeded MAX_VARINT');
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

  public deserialize (bytes: Buffer): (IVarint | Buffer)[] {
    if (this !== null) {
      throw new Error('deserialize() should only be called as a static method');
    }

    const firstByte = bytes[0];
    const result: (IVarint | Buffer)[] = [];
    let offset: number = 0;

    try {
      if (firstByte < 0xfd) {
        result.push(new Varint(BigInt(firstByte)));
        offset = 1;
      } else if (firstByte === 0xfd) {
        result.push(new Varint(BigInt(bytes.readUInt16BE(1))));
        offset = 3;
      } else if (firstByte === 0xfe) {
        result.push(new Varint(BigInt(bytes.readUInt32BE(1))));
        offset = 5;
      } else if (firstByte === 0xff) {
        result.push(new Varint(bytes.readBigUInt64BE(1)));
        offset = 9;
      } else {
        throw new Error('FATAL: Error while deserializing Buffer');
      }
    } catch (err) {

    }

    const leftovers = bytes.slice(offset);
    leftovers.length && result.push(leftovers);
    return result;
  }
}
