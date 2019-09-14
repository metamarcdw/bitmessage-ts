import { ISerializable } from './';
import { doubleSha512 } from '../crypto';

export interface IInventoryVector extends ISerializable {
  bmObject: ISerializable;
}

export class InventoryVector implements IInventoryVector {
  public bmObject: ISerializable;

  constructor (bmObject: ISerializable) {
    this.bmObject = bmObject;
  }

  public serialize (): Buffer {
    return doubleSha512(this.bmObject.serialize()).slice(0, 32);
  }
}
