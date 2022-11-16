import { bindLruMethods } from './SimpleLru.js';

export default function newCache(cacheParams, create) {
  if (!create) {
    create = cacheParams;
    cacheParams = {};
  }
  cacheParams.max = cacheParams.max || 1000;
  cacheParams.maxAge = cacheParams.maxAge || 1000 * 60 * 60;
  if (typeof cacheParams.dispose !== 'function') cacheParams.dispose = () => {}

  let cache;
  return cache = bindLruMethods(async (key, ...args) => {
    let promise = cache.get(key);
    if (!promise) {
      promise = (async() => await create(key, ...args))();
      cache.set(key, promise);
      (async () => { // Async remove promises with errors
        try { await promise; } catch (err) { cache.del(key); }
      })();
    }
    return promise;
  }, cacheParams);
}
