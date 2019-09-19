import { ISerializable } from './';
import { doubleSha512 } from '../util/crypto';

export interface IInventoryVector extends ISerializable {
  sha512hash: Buffer;
}

export class InventoryVector implements IInventoryVector {
  public sha512hash: Buffer;

  constructor (bmObject: ISerializable) {
    this.sha512hash = doubleSha512(bmObject.serialize()).slice(0, 32);
  }

  public serialize (): Buffer {
    return this.sha512hash;
  }
}
