import level from 'level';
import {
  AbstractOptions,
  AbstractGetOptions,
  AbstractBatch,
  AbstractChainedBatch,
  AbstractLevelDOWN
} from 'abstract-leveldown';

export class Inventory<K = any, V = any> {
  private db: AbstractLevelDOWN<K, V>

  constructor () {
    this.db = level('inventory');
  }

  public close (): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err: Error | undefined) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  public put (key: K, value: V, options?: AbstractOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!options) {
        this.db.put(key, value, (err: Error | undefined): void => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      } else {
        this.db.put(key, value, options, (err: Error | undefined): void => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      }
    });
  }

  public get (key: K, options?: AbstractGetOptions): Promise<V> {
    return new Promise((resolve, reject) => {
      if (!options) {
        this.db.get(key, (err: Error | undefined, value: V): void => {
          if (err) {
            return reject(err);
          }
          resolve(value);
        });
      } else {
        this.db.get(key, options, (err: Error | undefined, value: V): void => {
          if (err) {
            return reject(err);
          }
          resolve(value);
        });
      }
    });
  }

  public del (key: K, options?: AbstractOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!options) {
        this.db.del(key, (err: Error | undefined): void => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      } else {
        this.db.del(key, options, (err: Error | undefined): void => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      }
    });
  }

  public batch (
    array?: ReadonlyArray<AbstractBatch<K, V>> | undefined,
    options?: AbstractOptions,
  ): AbstractChainedBatch<K, V> | Promise<AbstractChainedBatch<K, V>> {
    if (!array && !options) {
      return this.db.batch();
    } else {
      return new Promise((resolve, reject) => {
        if (array && !options) {
          return this.db.batch(array, (err: Error | undefined) => {
            if (err) {
              return reject(err);
            }
            resolve();
          });
        } else if (array && options) {
          return this.db.batch(array, options, (err: Error | undefined) => {
            if (err) {
              return reject(err);
            }
            resolve();
          });
        } else {
          return reject(new Error('You must supply an array to use options'));
        }
      });
    }
  }
}
