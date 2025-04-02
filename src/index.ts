import { JsonKeyTranslatorImpl } from './json-key-translator';
import { TranslationOptions, JsonKeyTranslator } from './types';
import { BaseTranslator, GoogleTranslator, CustomTranslator } from './translators';

/**
 * 创建JSON键翻译器实例
 * @param options 翻译选项
 * @returns JsonKeyTranslator实例
 */
export function createJsonKeyTranslator(options: TranslationOptions = {}): JsonKeyTranslator {
  return new JsonKeyTranslatorImpl(options);
}

// 导出类型和主要类
export {
  JsonKeyTranslator,
  TranslationOptions,
  BaseTranslator,
  GoogleTranslator,
  CustomTranslator
};

// 默认导出createJsonKeyTranslator函数
export default createJsonKeyTranslator; 