import { ISerializable, IDeserializable } from './';

export interface INetAddress extends ISerializable, IDeserializable {
  time: bigint;
  stream: number;
  services: bigint;
  destination?: string;
  ip?: string;
  port?: number;
}

export class IPAddress implements INetAddress {
  public static deserialize = IPAddress.prototype.deserialize.bind(null);

  constructor (
    public stream: number,
    public services: bigint,
    public ip: string,
    public port: number,
    public time: bigint = BigInt(Date.now())
  ) {}

  public serialize (): Buffer {
    const bytes = Buffer.alloc(20);
    bytes.writeBigUInt64BE(this.time);
    bytes.writeUInt32BE(this.stream, 8);
    bytes.writeBigUInt64BE(this.services, 12);

    const portBytes = Buffer.alloc(2);
    portBytes.writeUInt16BE(this.port, 0);
    return Buffer.concat([bytes, IPAddress.encodeIPv4(this.ip), portBytes], 38);
  }

  public deserialize (bytes: Buffer): INetAddress {
    if (this !== null) {
      throw new Error('deserialize() should only be called as a static method');
    }
    if (bytes.length != 38) {
      throw new Error('Malformed IPAddress');
    }

    const time: bigint = bytes.readBigUInt64BE();
    const stream: number = bytes.readUInt32BE(8);
    const services: bigint = bytes.readBigUInt64BE(12);
    const ip: string = IPAddress.decodeIPv4(bytes.slice(32, 36))
    const port: number =  bytes.readUInt16BE(36);

    return new IPAddress(stream, services, ip, port, time);
  }

  private static encodeIPv4 (ip: string): Buffer {
    const ipBytes = ip.split('.')
      .map((strOctet: string): number => {
        const octet = parseInt(strOctet, 10);
        if (octet < 0 || octet > 0xff) {
          throw new Error('Malformed IPv4 Address');
        }
        return octet;
      })
      .reduce((acc: Buffer, cur: number, index: number): Buffer => {
        acc.writeUInt8(cur, index);
        return acc;
      }, Buffer.alloc(4));

    const prefix = Buffer.alloc(12);
    prefix.writeUInt16BE(0xffff, 10);
    return Buffer.concat([prefix, ipBytes], 16);
  }

  private static decodeIPv4(bytes: Buffer): string {
    return Array.from(bytes)
      .map((octet: number): string => {
        if (octet < 0 || octet > 0xff) {
          throw new Error('Malformed IPv4 Address');
        }
        return octet.toString(10);
      })
      .join('.');
  }
}

export class I2PAddress implements INetAddress {
  public static deserialize = I2PAddress.prototype.deserialize.bind(null);

  constructor (
    public stream: number,
    public services: bigint,
    public destination: string, // bmmkyafw6os62qd7g6rhmuewgnbrcaa3eykyrnjyggjgzoo3gb7q.b32.i2p
    public time: bigint = BigInt(Date.now())
  ) {}

  public serialize (): Buffer {
    const bytes = Buffer.alloc(20);
    bytes.writeBigUInt64BE(this.time);
    bytes.writeUInt32BE(this.stream, 8);
    bytes.writeBigUInt64BE(this.services, 12);
    return Buffer.concat([bytes, Buffer.from(this.destination, 'ascii')], 80);
  }

  public deserialize (bytes: Buffer): INetAddress {
    if (this !== null) {
      throw new Error('deserialize() should only be called as a static method');
    }
    if (bytes.length != 80) {
      throw new Error('Malformed I2PAddress');
    }

    const time: bigint = bytes.readBigUInt64BE();
    const stream: number = bytes.readUInt32BE(8);
    const services: bigint = bytes.readBigUInt64BE(12);
    const destination: string = bytes.slice(20).toString('ascii');

    return new I2PAddress(stream, services, destination, time);
  }
}
