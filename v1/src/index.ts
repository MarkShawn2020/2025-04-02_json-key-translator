/**
 * JSON翻译工具
 * 提供JSON翻译相关的功能
 */

// 导出schema生成器
export { generateSchema } from './schema-generator';

// 导出翻译相关函数和类型
export { 
  initTranslator,
  generateTranslationMap,
  translateJson,
  type TranslationMap
} from './translator';

/**
 * 完整的JSON翻译流程
 * @param json - 原始JSON对象
 * @param apiKey - OpenAI API密钥
 * @param targetLanguage - 目标语言，默认为中文
 * @returns 翻译后的JSON对象
 */
export async function translateJsonComplete(
  json: Record<string, any>,
  apiKey: string,
  targetLanguage: string = '中文'
): Promise<Record<string, any>> {
  // 导入所需函数
  const { generateSchema } = require('./schema-generator');
  const { initTranslator, generateTranslationMap, translateJson } = require('./translator');
  
  try {
    // 1. 生成JSON Schema
    console.log('Generating JSON schema...');
    const schema = generateSchema(json);
    
    // 2. 初始化翻译器
    console.log('Initializing translator...');
    initTranslator(apiKey);
    
    // 3. 生成翻译中间体
    console.log('Generating translation map...');
    const translationMap = await generateTranslationMap(schema, targetLanguage);
    
    // 4. 根据中间体翻译JSON
    console.log('Translating JSON...');
    const translatedJson = translateJson(json, translationMap);
    
    console.log('Translation completed successfully');
    return translatedJson;
  } catch (error) {
    console.error('Translation process failed:', error);
    throw error;
  }
} 