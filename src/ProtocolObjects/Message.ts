import { ISerializable, IDeserializable, Varint } from "./";

export interface IMessage extends ISerializable, IDeserializable {
  addressVersion: Varint;
  stream: Varint;
  pubkeyBehavior: number;
  publicSigningKey: Buffer;
  publicEncryptionKey: Buffer;
  nonceTrialsPerByte: Varint;
  extraBytes: Varint;
  destinationRipe: Buffer;
  encoding: Varint;
  messageLength: Varint;
  message: Buffer;
  ackLength: Varint;
  ackData: Buffer;
  sigLength: Varint;
  signature: Buffer;
}

export class Message implements IMessage {
  public static deserialize = Message.prototype.deserialize.bind(null);

  constructor (
    public addressVersion: Varint,
    public stream: Varint,
    public pubkeyBehavior: number,
    public publicSigningKey: Buffer,
    public publicEncryptionKey: Buffer,
    public nonceTrialsPerByte: Varint,
    public extraBytes: Varint,
    public destinationRipe: Buffer,
    public encoding: Varint,
    public messageLength: Varint,
    public message: Buffer,
    public ackLength: Varint,
    public ackData: Buffer,
    public sigLength: Varint,
    public signature: Buffer
  ) {}

  public serialize (): Buffer {
    return Buffer.concat([
      this.addressVersion.serialize(),
      this.stream.serialize(),
      Buffer.from([this.pubkeyBehavior]),
      this.publicSigningKey,
      this.publicEncryptionKey,
      this.nonceTrialsPerByte.serialize(),
      this.extraBytes.serialize(),
      this.destinationRipe,
      this.encoding.serialize(),
      this.messageLength.serialize(),
      this.message,
      this.ackLength.serialize(),
      this.ackData,
      this.sigLength.serialize(),
      this.signature
    ]);
  }

  public deserialize (bytes: Buffer): IMessage {
    if (this !== null) {
      throw new Error('deserialize() should only be called as a static method');
    }

    var [addressVersion, moreBytes] = Varint.deserialize(bytes);
    var [stream, moreBytes] = Varint.deserialize(moreBytes);

    const pubkeyBehavior = moreBytes.readUInt32BE(0);
    const publicSigningKey = moreBytes.slice(4, 68);
    const publicEncryptionKey = moreBytes.slice(68, 132);
    
    var [nonceTrialsPerByte, moreBytes] = Varint.deserialize(moreBytes.slice(132));
    var [extraBytes, moreBytes] = Varint.deserialize(moreBytes);

    const destinationRipe = moreBytes.slice(0, 20);
    var [encoding, moreBytes] = Varint.deserialize(moreBytes.slice(20));

    var [messageLength, moreBytes] = Varint.deserialize(moreBytes);
    const numMessageLength = Number(messageLength.value);
    const message = moreBytes.slice(0, numMessageLength);

    var [ackLength, moreBytes] = Varint.deserialize(moreBytes.slice(numMessageLength));
    const numAckLength = Number(ackLength.value);
    const ackData = moreBytes.slice(0, numAckLength);

    var [sigLength, moreBytes] = Varint.deserialize(moreBytes.slice(numAckLength));
    const numSigLength = Number(sigLength.value);
    const signature = moreBytes.slice(0, numSigLength);

    return new Message(
      addressVersion, stream, pubkeyBehavior,
      publicSigningKey, publicEncryptionKey,
      nonceTrialsPerByte, extraBytes,
      destinationRipe, encoding,
      messageLength, message,
      ackLength, ackData,
      sigLength, signature
    );
  }
}

export enum Encodings {
  IGNORE,
  TRIVIAL,
  SIMPLE,
  EXTENDED
}

export enum PubkeyFeatures {
  None = 0,
  DoesAck = 1 << 0,
  IncludeDestination = 1 << 1,
  ExtendedEncoding = 1 << 2,
  ForwardSecrecy = 1 << 3,
  OnionRouter = 1 << 4
}
