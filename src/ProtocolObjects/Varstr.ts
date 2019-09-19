import { IProtocolObject, IVarint, Varint } from './';

export interface IVarstr extends IProtocolObject {
  head: IVarint;
  body: Buffer;
  length: number;
  value: string;
}

export class Varstr implements IVarstr {
  public head: IVarint;
  public body: Buffer;

  public static deserialize = Varstr.prototype.deserialize.bind(null);

  constructor (str: string) {
    this.head = new Varint(BigInt(str.length));
    this.body = Buffer.from(str, 'ascii');
  }

  public get length (): number {
    return this.head.length + this.body.length;
  }

  public get value (): string {
    return this.body.toString('ascii');
  }

  public serialize (): Buffer {
    const headBuffer = this.head.serialize();
    return Buffer.concat([headBuffer, this.body], this.length);
  }

  public deserialize (bytes: Buffer): (IVarstr | Buffer)[] {
    if (this !== null) {
      throw new Error('deserialize() should only be called as a static method');
    }

    const [lengthVarint, moreBytes] = Varint.deserialize(bytes);
    if (!moreBytes) {
      throw new Error('Malformed Varstr');
    }
    const strLength = Number((lengthVarint as IVarint).value);
    const stringBytes = moreBytes as Buffer;

    const result: (IVarstr | Buffer)[] = [
      new Varstr(stringBytes.slice(0, strLength).toString())
    ];
    const leftovers = stringBytes.slice(strLength);
    leftovers.length && result.push(leftovers);
    return result;
  }
}
