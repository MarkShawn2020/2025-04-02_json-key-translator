import { TranslationCacheEntry } from './types';

/**
 * LRU缓存实现，用于缓存翻译结果
 */
export class TranslationCache {
  private cache: Map<string, TranslationCacheEntry>;
  private maxSize: number;
  private keyOrder: string[] = [];

  constructor(maxSize = 1000) {
    this.cache = new Map<string, TranslationCacheEntry>();
    this.maxSize = maxSize;
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(originalKey: string, from: string, to: string): string {
    return `${originalKey}|${from}|${to}`;
  }

  /**
   * 获取缓存项
   */
  get(originalKey: string, from: string, to: string): string | null {
    const key = this.getCacheKey(originalKey, from, to);
    const entry = this.cache.get(key);
    
    if (entry) {
      // 更新使用顺序（将项移到末尾表示最近使用）
      this.updateKeyOrder(key);
      return entry.translatedKey;
    }
    
    return null;
  }

  /**
   * 设置缓存项
   */
  set(originalKey: string, translatedKey: string, from: string, to: string): void {
    const key = this.getCacheKey(originalKey, from, to);
    
    // 如果已存在，先删除旧位置
    if (this.cache.has(key)) {
      this.updateKeyOrder(key);
    } else {
      // 检查是否需要淘汰
      this.evictIfNeeded();
      // 添加到最近使用
      this.keyOrder.push(key);
    }
    
    // 更新或添加缓存
    this.cache.set(key, { originalKey, translatedKey, from, to });
  }

  /**
   * 更新键的使用顺序
   */
  private updateKeyOrder(key: string): void {
    const index = this.keyOrder.indexOf(key);
    if (index !== -1) {
      this.keyOrder.splice(index, 1);
      this.keyOrder.push(key);
    }
  }

  /**
   * 如果缓存满了，淘汰最不常用的项
   */
  private evictIfNeeded(): void {
    if (this.keyOrder.length >= this.maxSize) {
      const oldestKey = this.keyOrder.shift();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.keyOrder = [];
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }
} 