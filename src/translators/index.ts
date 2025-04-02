import { TranslationOptions } from '../types';
import { BaseTranslator } from './base-translator';
import { GoogleTranslator } from './google-translator';
import { CustomTranslator } from './custom-translator';

/**
 * 翻译器工厂，创建对应的翻译器实例
 */
export function createTranslator(options: TranslationOptions): BaseTranslator {
  const provider = options.provider || 'google';
  
  switch (provider) {
    case 'google':
      return new GoogleTranslator(options);
    case 'custom':
      return new CustomTranslator(options);
    // 可以扩展支持其他翻译服务
    // case 'openai':
    //   return new OpenAITranslator(options);
    default:
      throw new Error(`不支持的翻译提供商: ${provider}`);
  }
}

export { BaseTranslator, GoogleTranslator, CustomTranslator }; 