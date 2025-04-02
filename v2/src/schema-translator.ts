import { BaseTranslator } from './translators/base-translator';
import { TranslationOptions } from './types';
import { createTranslator } from './translators';
import { TranslationCache } from './cache';

/**
 * 基于Schema的JSON翻译器
 * 通过提取所有键一次性翻译，然后重构JSON，提高性能并减少API调用
 */
export class SchemaTranslator {
  private translator: BaseTranslator;
  private cache: TranslationCache | null = null;
  private batchSize: number;
  private logger: (message: string, level: 'info' | 'error' | 'debug') => void;

  constructor(options: TranslationOptions = {}) {
    this.translator = createTranslator(options);
    this.batchSize = options.batchSize || 50; // 默认更大的批处理大小
    
    // 初始化缓存
    if (options.useCache !== false) {
      this.cache = new TranslationCache(options.maxCacheSize);
    }
    
    this.logger = options.logger || this.defaultLogger;
  }

  /**
   * 提取JSON中所有唯一键
   */
  private extractKeys(json: Record<string, any>): string[] {
    const keys: Set<string> = new Set();
    
    const extractKeysRecursive = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      if (Array.isArray(obj)) {
        // 处理数组中的对象
        obj.forEach(item => {
          if (item && typeof item === 'object') {
            extractKeysRecursive(item);
          }
        });
        return;
      }
      
      // 处理对象
      Object.keys(obj).forEach(key => {
        keys.add(key);
        const value = obj[key];
        if (value && typeof value === 'object') {
          extractKeysRecursive(value);
        }
      });
    };
    
    extractKeysRecursive(json);
    this.logger(`提取了 ${keys.size} 个唯一键`, 'info');
    return Array.from(keys);
  }

  /**
   * 批量翻译所有键
   */
  private async translateKeys(keys: string[]): Promise<Record<string, string>> {
    const translationMap: Record<string, string> = {};
    const sourceLanguage = this.translator['sourceLanguage'];
    const targetLanguage = this.translator['targetLanguage'];
    
    // 检查缓存
    const keysToTranslate: string[] = [];
    for (const key of keys) {
      if (this.cache) {
        const cachedTranslation = this.cache.get(key, sourceLanguage, targetLanguage);
        if (cachedTranslation) {
          translationMap[key] = cachedTranslation;
          continue;
        }
      }
      keysToTranslate.push(key);
    }
    
    if (keysToTranslate.length === 0) {
      this.logger('所有键都在缓存中找到', 'info');
      return translationMap;
    }
    
    this.logger(`需要翻译 ${keysToTranslate.length} 个键`, 'info');
    
    // 分批处理键
    for (let i = 0; i < keysToTranslate.length; i += this.batchSize) {
      const batch = keysToTranslate.slice(i, i + this.batchSize);
      this.logger(`翻译批次 ${Math.floor(i / this.batchSize) + 1}，包含 ${batch.length} 个键`, 'info');
      
      try {
        const results = await this.translator.batchTranslate(batch);
        
        // 更新翻译映射和缓存
        for (let j = 0; j < batch.length; j++) {
          const originalKey = batch[j];
          const translatedKey = results[j];
          translationMap[originalKey] = translatedKey;
          
          // 更新缓存
          if (this.cache) {
            this.cache.set(originalKey, translatedKey, sourceLanguage, targetLanguage);
          }
        }
      } catch (error) {
        this.logger(`批量翻译失败: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        
        // 翻译失败时使用原键
        batch.forEach(key => {
          translationMap[key] = key;
        });
        
        // 尝试一个一个翻译
        this.logger('尝试单个翻译键...', 'info');
        for (const key of batch) {
          try {
            const result = await this.translator.translate(key);
            translationMap[key] = result;
            
            if (this.cache) {
              this.cache.set(key, result, sourceLanguage, targetLanguage);
            }
          } catch (e) {
            this.logger(`单个键 "${key}" 翻译失败`, 'error');
            translationMap[key] = key; // 失败时使用原键
          }
        }
      }
    }
    
    return translationMap;
  }

  /**
   * 使用翻译后的键重构JSON
   */
  private rebuildJson(json: any, translationMap: Record<string, string>): any {
    if (!json || typeof json !== 'object') {
      return json;
    }
    
    if (Array.isArray(json)) {
      return json.map(item => this.rebuildJson(item, translationMap));
    }
    
    const result: Record<string, any> = {};
    
    for (const key of Object.keys(json)) {
      const translatedKey = translationMap[key] || key;
      const value = json[key];
      
      if (value && typeof value === 'object') {
        result[translatedKey] = this.rebuildJson(value, translationMap);
      } else {
        result[translatedKey] = value;
      }
    }
    
    return result;
  }

  /**
   * 翻译JSON对象的所有键
   */
  async translateJson(json: Record<string, any>): Promise<Record<string, any>> {
    if (!json || typeof json !== 'object') {
      return json;
    }
    
    this.logger('开始基于Schema的JSON翻译', 'info');
    
    // 1. 提取所有唯一键
    const keys = this.extractKeys(json);
    
    // 2. 批量翻译键
    const translationMap = await this.translateKeys(keys);
    
    // 3. 重构JSON
    const result = this.rebuildJson(json, translationMap);
    
    this.logger('JSON翻译完成', 'info');
    return result;
  }

  /**
   * 清除翻译缓存
   */
  clearCache(): void {
    if (this.cache) {
      this.cache.clear();
    }
  }
  
  /**
   * 默认日志处理
   */
  private defaultLogger(message: string, level: 'info' | 'error' | 'debug'): void {
    if (level === 'error') {
      console.error(`[Schema-Translator][${level}] ${message}`);
    } else if (level === 'info') {
      console.log(`[Schema-Translator][${level}] ${message}`);
    }
    // debug级别默认不输出
  }
} 