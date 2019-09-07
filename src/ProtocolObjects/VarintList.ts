import { IProtocolObject, IVarint, Varint } from './';

export interface IVarintList extends IProtocolObject {
  head: IVarint;
  body: IVarint[];
  value: bigint[];
}

export class VarintList implements IVarintList {
  public head: IVarint;
  public body: IVarint[];

  constructor (list: bigint[]) {
    if (list.length > Number.MAX_SAFE_INTEGER) {
      throw new Error('This list is too large to be deserializable');
    }
    this.head = new Varint(BigInt(list.length));
    this.body = list.map((item: bigint) => new Varint(item));
  }

  public get length (): number {
    const bodyLength = this.body.reduce((acc: number, cur: IVarint) => {
      return acc += cur.length;
    }, 0);
    return this.head.length + bodyLength;
  }

  public get value (): bigint[] {
    return this.body.map((varint: IVarint) => varint.value);
  }

  public serialize (): Buffer {
    const headBuffer = this.head.serialize();
    const bodyBuffer = this.body.reduce((acc: Buffer, cur: IVarint) => {
        return Buffer.concat([acc, cur.serialize()]);
    }, Buffer.alloc(0));
    return Buffer.concat([headBuffer, bodyBuffer], this.length);
  }

  public static deserialize (bytes: Buffer): (IVarintList | Buffer)[] {
    let [lengthVarint, moreBytes] = Varint.deserialize(bytes);
    if (!moreBytes) {
      throw new Error('Malformed VarintList');
    }
    const listLength = Number((lengthVarint as IVarint).value);
    let listBytes = moreBytes as Buffer;

    if (listLength > Number.MAX_SAFE_INTEGER) {
      throw new Error('This list is too large to be deserializable');
    }

    const list: bigint[] = [];
    for (let i = 0; i < listLength; i++) {
      let [varint, moreBytes] = Varint.deserialize(listBytes);
      if (i !== listLength - 1 && !moreBytes) {
        throw new Error('Malformed VarintList');
      }
      list.push((varint as IVarint).value);
      listBytes = moreBytes as Buffer;
    }
    
    const result: (IVarintList | Buffer)[] = [
      new VarintList(list)
    ];
    if (listBytes && listBytes.length > 0) {
      result.push(listBytes);
    }
    return result;
  }
}
