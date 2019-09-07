import { IProtocolObject, IVarint, Varint } from './';

export interface IVarstr extends IProtocolObject {
  head: IVarint;
  body: Buffer;
  value: string;
}

export class Varstr implements IVarstr {
  public head: IVarint;
  public body: Buffer;

  constructor (str: string) {
    if (str.length > Number.MAX_SAFE_INTEGER) {
      throw new Error('This string is too large to be deserializable');
    }
    this.head = new Varint(BigInt(str.length));
    this.body = Buffer.from(str);
  }

  public get length (): number {
    return this.head.length + this.body.length;
  }

  public get value (): string {
    return this.body.toString();
  }

  public serialize (): Buffer {
    const headBuffer = this.head.serialize();
    return Buffer.concat([headBuffer, this.body], this.length);
  }

  public static deserialize (bytes: Buffer): (IVarstr | Buffer)[] {
    const [lengthVarint, moreBytes] = Varint.deserialize(bytes);
    if (!moreBytes) {
      throw new Error('Malformed Varstr');
    }
    const strLength = Number((lengthVarint as IVarint).value);
    const stringBytes = moreBytes as Buffer;

    if (strLength > Number.MAX_SAFE_INTEGER) {
      throw new Error('This string is too large to be deserializable');
    }

    const result: (IVarstr | Buffer)[] = [
      new Varstr(stringBytes.slice(0, strLength).toString())
    ];
    const leftovers = stringBytes.slice(strLength);
    if (leftovers.length > 0) {
      result.push(leftovers);
    }
    return result;
  }
}
