export interface TranslationOptions {
  /**
   * 源语言 (默认: 'en')
   */
  sourceLanguage?: string;
  
  /**
   * 目标语言 (默认: 'zh-CN')
   */
  targetLanguage?: string;
  
  /**
   * 翻译服务提供商 (默认: 'google')
   */
  provider?: 'google' | 'openai' | 'azure' | 'custom';
  
  /**
   * 自定义翻译函数
   */
  customTranslator?: (text: string, from: string, to: string) => Promise<string>;
  
  /**
   * API密钥（如果使用第三方服务）
   */
  apiKey?: string;
  
  /**
   * 缓存已翻译的键
   */
  useCache?: boolean;
  
  /**
   * 最大缓存大小（条目数）
   */
  maxCacheSize?: number;
  
  /**
   * 批处理大小（用于批量翻译）
   */
  batchSize?: number;

  /**
   * 自定义日志函数
   */
  logger?: (message: string, level: 'info' | 'error' | 'debug') => void;
}

export interface JsonKeyTranslator {
  /**
   * 翻译JSON对象中的键
   */
  translateKeys(json: Record<string, any>): Promise<Record<string, any>>;
  
  /**
   * 翻译单个键
   */
  translateKey(key: string): Promise<string>;
  
  /**
   * 清除翻译缓存
   */
  clearCache(): void;
}

export interface TranslationCacheEntry {
  originalKey: string;
  translatedKey: string;
  from: string;
  to: string;
} 