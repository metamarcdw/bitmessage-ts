import { ISerializable, IDeserializable, CURVE_TYPE } from './';

export interface IEncryptedPayload extends ISerializable, IDeserializable {
  aesInitVector: Buffer;
  curveType: number;
  xLength: number;
  yLength: number;
  xValue: Buffer;
  yValue: Buffer;
  cipherText: Buffer;
  hmac: Buffer;
}

export class EncryptedPayload implements IEncryptedPayload {
  public static deserialize = EncryptedPayload.prototype.deserialize.bind(null);

  constructor (
    public aesInitVector: Buffer,
    public xLength: number,
    public yLength: number,
    public xValue: Buffer,
    public yValue: Buffer,
    public cipherText: Buffer,
    public hmac: Buffer,
    public curveType: number = CURVE_TYPE
  ) {}

  public get length () {
    return 54 + this.xLength + this.yLength + this.cipherText.length;
  }

  public serialize (): Buffer {
    return Buffer.concat([
      this.aesInitVector,
      Buffer.from([this.curveType, this.xLength]),
      this.xValue,
      Buffer.from([this.yLength]),
      this.yValue,
      this.cipherText,
      this.hmac
    ], this.length);
  }

  public deserialize (bytes: Buffer): (IEncryptedPayload | Buffer)[] {
    if (this !== null) {
      throw new Error('deserialize() should only be called as a static method');
    }

    const aesInitVector = bytes.slice(0, 16);
    const curveType = bytes.readUInt16BE(16);
    const xLength = bytes.readUInt16BE(18);

    let offset = 20 + xLength;
    const xValue = bytes.slice(20, offset);
    const yLength = bytes.readUInt16BE(offset);

    offset += 2;
    const yValue = bytes.slice(offset, offset + yLength);
    const cipherText = bytes.slice(offset + yLength, bytes.length - 32);
    const hmac = bytes.slice(bytes.length - 32);

    const payload = new EncryptedPayload(
      aesInitVector,
      xLength, yLength,
      xValue, yValue,
      cipherText, hmac,
      curveType
    );
    const result: (IEncryptedPayload | Buffer)[] = [payload];
    const leftovers = bytes.slice(payload.length);
    leftovers.length && result.push(leftovers);
    return result;
  }
}
