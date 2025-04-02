import { JsonKeyTranslator, TranslationOptions } from './types';
import { BaseTranslator } from './translators/base-translator';
import { createTranslator } from './translators';
import { TranslationCache } from './cache';

/**
 * JSON键翻译器实现类
 */
export class JsonKeyTranslatorImpl implements JsonKeyTranslator {
  private translator: BaseTranslator;
  private cache: TranslationCache | null = null;
  private batchSize: number;
  
  constructor(options: TranslationOptions = {}) {
    this.translator = createTranslator(options);
    
    // 初始化缓存
    if (options.useCache !== false) {
      this.cache = new TranslationCache(options.maxCacheSize);
    }
    
    // 设置批处理大小
    this.batchSize = options.batchSize || 10;
  }
  
  /**
   * 翻译单个键
   */
  async translateKey(key: string): Promise<string> {
    if (!key || typeof key !== 'string') return key;
    
    const sourceLanguage = this.translator['sourceLanguage'];
    const targetLanguage = this.translator['targetLanguage'];
    
    // 检查缓存
    if (this.cache) {
      const cachedTranslation = this.cache.get(key, sourceLanguage, targetLanguage);
      if (cachedTranslation) return cachedTranslation;
    }
    
    // 翻译键
    try {
      const translatedKey = await this.translator.translate(key);
      
      // 存入缓存
      if (this.cache) {
        this.cache.set(key, translatedKey, sourceLanguage, targetLanguage);
      }
      
      return translatedKey;
    } catch (error) {
      // 翻译失败时返回原键
      console.error(`翻译键失败: ${key}`, error);
      return key;
    }
  }
  
  /**
   * 递归翻译JSON对象的所有键
   */
  async translateKeys(json: Record<string, any>): Promise<Record<string, any>> {
    if (!json || typeof json !== 'object' || Array.isArray(json)) {
      return json;
    }
    
    // 收集所有需要翻译的键
    const keys = Object.keys(json);
    const keysToTranslate: string[] = [];
    const keyMap: Record<string, string> = {};
    
    // 预处理：收集所有需要翻译的键
    for (const key of keys) {
      if (typeof key === 'string') {
        keysToTranslate.push(key);
        keyMap[key] = key; // 初始值设为原键
      }
    }
    
    // 批量翻译键
    if (keysToTranslate.length > 0) {
      // 分批处理翻译，避免一次发送太多请求
      for (let i = 0; i < keysToTranslate.length; i += this.batchSize) {
        const batch = keysToTranslate.slice(i, i + this.batchSize);
        
        // 检查缓存中是否已存在
        const sourceLanguage = this.translator['sourceLanguage'];
        const targetLanguage = this.translator['targetLanguage'];
        const translationPromises = batch.map(key => {
          if (this.cache) {
            const cached = this.cache.get(key, sourceLanguage, targetLanguage);
            if (cached) return Promise.resolve(cached);
          }
          return this.translator.translate(key);
        });
        
        try {
          const translatedBatch = await Promise.all(translationPromises);
          
          // 更新keyMap和缓存
          for (let j = 0; j < batch.length; j++) {
            const originalKey = batch[j];
            const translatedKey = translatedBatch[j];
            keyMap[originalKey] = translatedKey;
            
            // 存入缓存
            if (this.cache) {
              this.cache.set(originalKey, translatedKey, sourceLanguage, targetLanguage);
            }
          }
        } catch (error) {
          console.error('批量翻译键失败', error);
          // 出错时使用原键
        }
      }
    }
    
    // 构建翻译后的对象
    const result: Record<string, any> = {};
    
    for (const key of keys) {
      const translatedKey = keyMap[key];
      const value = json[key];
      
      // 递归处理嵌套对象
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[translatedKey] = await this.translateKeys(value);
      } else if (Array.isArray(value)) {
        // 处理数组：不翻译键但递归处理数组中的对象
        result[translatedKey] = await Promise.all(
          value.map(item => 
            item && typeof item === 'object' 
              ? this.translateKeys(item)
              : item
          )
        );
      } else {
        // 直接赋值非对象属性
        result[translatedKey] = value;
      }
    }
    
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
} 