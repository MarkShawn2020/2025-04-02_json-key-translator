import { TranslationOptions } from '../types';

/**
 * 基础翻译服务抽象类
 */
export abstract class BaseTranslator {
  protected sourceLanguage: string;
  protected targetLanguage: string;
  protected apiKey?: string;
  protected logger: (message: string, level: 'info' | 'error' | 'debug') => void;

  constructor(options: TranslationOptions) {
    this.sourceLanguage = options.sourceLanguage || 'en';
    this.targetLanguage = options.targetLanguage || 'zh-CN';
    this.apiKey = options.apiKey;
    this.logger = options.logger || this.defaultLogger;
  }

  /**
   * 翻译单个文本
   */
  abstract translate(text: string): Promise<string>;

  /**
   * 批量翻译多个文本
   * 默认实现是串行翻译，子类可以覆盖为并行或批处理
   */
  async batchTranslate(texts: string[]): Promise<string[]> {
    this.logger(`批量翻译 ${texts.length} 个文本`, 'info');
    const results: string[] = [];
    for (const text of texts) {
      results.push(await this.translate(text));
    }
    return results;
  }

  /**
   * 默认日志处理
   */
  private defaultLogger(message: string, level: 'info' | 'error' | 'debug'): void {
    if (level === 'error') {
      console.error(`[JSON-Translator][${level}] ${message}`);
    } else if (level === 'info') {
      console.log(`[JSON-Translator][${level}] ${message}`);
    }
    // debug级别默认不输出
  }
} 