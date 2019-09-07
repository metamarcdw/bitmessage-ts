export const MAGIC = 0xE9BEB4D9;

export interface IProtocolObject {
  head: null | number | IProtocolObject;
  body: number | string | Buffer |
    (number | string | Buffer | IProtocolObject)[];
  length: number;
  serialize: () => Buffer;
};

export { IVarint, Varint } from './Varint';
export { IVarstr, Varstr } from './Varstr';
export { IVarintList, VarintList } from './VarintList';
