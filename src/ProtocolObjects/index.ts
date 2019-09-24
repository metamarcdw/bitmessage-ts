export const MAGIC = 0xE9BEB4D9;
export const CURVE_TYPE = 0x02CA;

export interface ISerializable {
  serialize: () => Buffer;
}

export interface IDeserializable {
  deserialize: (bytes: Buffer) => ISerializable | [ISerializable, Buffer];
}

export interface IProtocolObject extends ISerializable, IDeserializable {
  head: null | number | IProtocolObject;
  body: number | string | Buffer |
    (number | string | Buffer | IProtocolObject)[];
};

export { IVarint, Varint } from './Varint';
export { IVarstr, Varstr } from './Varstr';
export { IVarintList, VarintList } from './VarintList';
export { INetAddress, IPAddress, I2PAddress } from './NetAddress';
export { IInventoryVector, InventoryVector } from './InventoryVector';
export { IEncryptedPayload, EncryptedPayload } from './EncryptedPayload';
export { IMessage, Message, Encodings, PubkeyFeatures } from './Message';
