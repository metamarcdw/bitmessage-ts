import { ISerializable } from './';

export interface INetAddress extends ISerializable {
  time: bigint;
  stream: number;
  services: bigint;
  destination?: string;
  ip?: string;
  port?: number;
}

export class IPAddress implements INetAddress {
  public time: bigint;
  public stream: number;
  public services: bigint;
  public ip: string;
  public port: number;

  constructor (
    stream: number,
    services: bigint,
    ip: string,
    port: number,
    time: bigint = BigInt(Date.now())
  ) {
    this.time = time;
    this.stream = stream;
    this.services = services;
    this.ip = ip;
    this.port = port;
  }

  public serialize (): Buffer {
    const bytes = Buffer.alloc(20);
    bytes.writeBigUInt64BE(this.time);
    bytes.writeUInt32BE(this.stream, 8);
    bytes.writeBigInt64BE(this.services, 12);

    const portBytes = Buffer.alloc(2);
    portBytes.writeUInt16BE(this.port, 0);
    return Buffer.concat([bytes, IPAddress.encodeIPv4(this.ip), portBytes]);
  }

  public static deserialize (bytes: Buffer): INetAddress {
    if (bytes.length !== 38) {
      throw new Error('Malformed IPAddress');
    }

    const time: bigint = bytes.readBigUInt64BE();
    const stream: number = bytes.readUInt32BE(8);
    const services: bigint = bytes.readBigUInt64BE(12);
    const ip: string = this.decodeIPv4(bytes.slice(32, 36))

    const port: number =  bytes.readUInt16BE(36);
    return new IPAddress(stream, services, ip, port, time);
  }

  private static encodeIPv4 (ip: string): Buffer {
    const ipBytes = ip.split('.')
      .map((strOctet: string): number => parseInt(strOctet))
      .reduce((acc: Buffer, cur: number, index: number): Buffer => {
        acc.writeUInt8(cur, index);
        return acc;
      }, Buffer.alloc(4));

    const prefix = Buffer.alloc(12);
    prefix.writeUInt16BE(0xffff, 10);
    return Buffer.concat([prefix, ipBytes]);
  }

  private static decodeIPv4(bytes: Buffer): string {
    return Array.from(bytes)
      .map((octet: number): string => octet.toString(10))
      .join('.');
  }
}

export class I2PAddress implements INetAddress {
  public time: bigint;
  public stream: number;
  public services: bigint;
  public destination: string;
  // bmmkyafw6os62qd7g6rhmuewgnbrcaa3eykyrnjyggjgzoo3gb7q.b32.i2p

  constructor (
    stream: number,
    services: bigint,
    destination: string,
    time: bigint = BigInt(Date.now())
  ) {
    this.time = time;
    this.stream = stream;
    this.services = services;
    this.destination = destination;
  }

  public serialize (): Buffer {
    const bytes = Buffer.alloc(20);
    bytes.writeBigUInt64BE(this.time);
    bytes.writeUInt32BE(this.stream, 8);
    bytes.writeBigInt64BE(this.services, 12);
    return Buffer.concat([bytes, Buffer.from(this.destination, 'ascii')]);
  }

  public static deserialize (bytes: Buffer): INetAddress {
    if (bytes.length !== 80) {
      throw new Error('Malformed IPAddress');
    }

    const time: bigint = bytes.readBigUInt64BE();
    const stream: number = bytes.readUInt32BE(8);
    const services: bigint = bytes.readBigUInt64BE(12);
    const destination: string = bytes.slice(20).toString('ascii');

    return new I2PAddress(stream, services, destination, time);
  }
}
