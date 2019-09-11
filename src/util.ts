import * as crypto from 'crypto';

export function sha512(bytes: Buffer): Buffer {
  return crypto.createHash('sha512').update(bytes).digest();
}

export function doubleSha512(bytes: Buffer): Buffer {
  return sha512(sha512(bytes));
}

export function ripeMd160(bytes: Buffer): Buffer {
  return crypto.createHash('ripemd160').update(bytes).digest();
}

export function addressHash(bytes: Buffer): Buffer {
  return ripeMd160(sha512(bytes));
}
