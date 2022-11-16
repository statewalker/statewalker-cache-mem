import newCache from './newCache.js';

export default function newActiveCache(cacheParams, factory) {
  cacheParams = cacheParams || {};
  const result = newCache(cacheParams, factory);
  const pruneTimeout = cacheParams.pruneTimeout || cacheParams.maxAge || 60 * 1000;
  const intervalId = setInterval(() => result.prune(), pruneTimeout);
  const prevClose = result.close;
  result.close = () => {
    clearInterval(intervalId);
    prevClose.call(result);
  }
  return result;
}
