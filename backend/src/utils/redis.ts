// Redis缓存工具（可扩展实现）
// 当前为内存缓存占位符，生产环境请替换为真实Redis客户端

interface CacheItem {
  value: any;
  expireAt: number;
}

const cache = new Map<string, CacheItem>();

// 设置缓存
export function setCache(key: string, value: any, ttl: number = 300): void {
  cache.set(key, {
    value,
    expireAt: Date.now() + ttl * 1000
  });
}

// 获取缓存
export function getCache<T>(key: string): T | null {
  const item = cache.get(key);
  
  if (!item) return null;
  
  if (Date.now() > item.expireAt) {
    cache.delete(key);
    return null;
  }
  
  return item.value as T;
}

// 删除缓存
export function deleteCache(key: string): void {
  cache.delete(key);
}

// 清空缓存
export function clearCache(): void {
  cache.clear();
}

// 批量删除（按前缀）
export function deleteByPrefix(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

// 缓存装饰器（用于函数结果缓存）
export function cached(ttl: number = 300) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      const cached = getCache(cacheKey);
      
      if (cached !== null) {
        return cached;
      }
      
      const result = originalMethod.apply(this, args);
      
      // 如果返回Promise
      if (result && typeof result.then === 'function') {
        return result.then((data: any) => {
          setCache(cacheKey, data, ttl);
          return data;
        });
      }
      
      setCache(cacheKey, result, ttl);
      return result;
    };
    
    return descriptor;
  };
}