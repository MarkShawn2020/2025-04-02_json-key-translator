import { TranslationOptions } from '../types';
import { BaseTranslator } from './base-translator';

/**
 * 自定义翻译器
 */
export class CustomTranslator extends BaseTranslator {
  private translatorFn: (text: string, from: string, to: string) => Promise<string>;
  
  constructor(options: TranslationOptions) {
    super(options);
    
    if (!options.customTranslator) {
      throw new Error('CustomTranslator需要提供customTranslator函数');
    }
    
    this.translatorFn = options.customTranslator;
  }
  
  async translate(text: string): Promise<string> {
    try {
      return await this.translatorFn(text, this.sourceLanguage, this.targetLanguage);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      this.logger(`自定义翻译失败: ${errorMsg}`, 'error');
      throw new Error(`自定义翻译失败: ${errorMsg}`);
    }
  }
} 