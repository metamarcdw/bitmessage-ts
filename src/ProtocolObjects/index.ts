export const MAGIC = 0xE9BEB4D9;

export interface ISerializable {
  serialize: () => Buffer;
}

export interface IProtocolObject extends ISerializable {
  head: null | number | IProtocolObject;
  body: number | string | Buffer |
    (number | string | Buffer | IProtocolObject)[];
};

export { IVarint, Varint } from './Varint';
export { IVarstr, Varstr } from './Varstr';
export { IVarintList, VarintList } from './VarintList';
export { INetAddress, IPAddress, I2PAddress } from './NetAddress';
export { IInventoryVector, InventoryVector } from './InventoryVector';
