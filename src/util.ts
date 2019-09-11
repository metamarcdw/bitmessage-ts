import * as crypto from 'crypto';

export function sha512(bytes: Buffer): Buffer {
  return crypto.createHash('sha512').update(bytes).digest();
}

export function doubleSha512(bytes: Buffer): Buffer {
  return sha512(sha512(bytes));
}
