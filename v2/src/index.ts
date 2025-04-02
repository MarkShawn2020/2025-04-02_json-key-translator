import { JsonKeyTranslatorImpl } from './json-key-translator';
import { TranslationOptions, JsonKeyTranslator } from './types';
import { BaseTranslator, GoogleTranslator, CustomTranslator } from './translators';
import { SchemaTranslator } from './schema-translator';

/**
 * 创建JSON键翻译器实例
 * @param options 翻译选项
 * @returns JsonKeyTranslator实例
 */
export function createJsonKeyTranslator(options: TranslationOptions = {}): JsonKeyTranslator {
  return new JsonKeyTranslatorImpl(options);
}

/**
 * 创建基于Schema的JSON翻译器实例
 * 通过提取所有键一次性翻译，然后重构JSON，提高性能并减少API调用
 * @param options 翻译选项
 * @returns SchemaTranslator实例
 */
export function createSchemaTranslator(options: TranslationOptions = {}): SchemaTranslator {
  return new SchemaTranslator(options);
}

// 导出类型和主要类
export {
  JsonKeyTranslator,
  TranslationOptions,
  BaseTranslator,
  GoogleTranslator,
  CustomTranslator,
  SchemaTranslator
};

// 默认导出createJsonKeyTranslator函数
export default createJsonKeyTranslator; 