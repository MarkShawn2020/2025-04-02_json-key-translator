import { KeyMappingResult, TranslationOptions } from './types';

// 添加类型定义
interface SchemaValue {
  type: string;
  properties?: Record<string, SchemaValue>;
  items?: SchemaValue;
  [key: string]: any;
}

/**
 * Placeholder for the LLM translation function
 * In a real implementation, this would call an LLM API
 */
async function defaultTranslationFn(schema: object, options: TranslationOptions): Promise<object> {
  console.log('Using default translation function - in real use, this would call an LLM API');
  // This is just a placeholder that doesn't do any actual translation
  return schema;
}

/**
 * Translates the keys in a JSON schema
 * @param schema The JSON schema to translate
 * @param options Translation options
 * @returns The translated schema and key mapping
 */
export async function translateKeys(schema: any, options: TranslationOptions = {}): Promise<KeyMappingResult> {
  const {
    sourceLanguage = 'en',
    targetLanguage = 'zh',
    translationFn = defaultTranslationFn,
    keyMap: existingKeyMap = {}
  } = options;
  
  // Clone the existing key map to avoid modifying the input
  const keyMap = { ...existingKeyMap };
  
  // Use provided translation function or default
  const translatedSchema = await translationFn(schema, {
    sourceLanguage, 
    targetLanguage
  });
  
  // Extract key mappings using i18n-style path-based approach
  createI18nStyleKeyMap(schema, translatedSchema, keyMap);
  
  return {
    keyMap,
    translatedSchema
  };
}

/**
 * 创建类似于i18n风格的键映射，使用完整路径作为键
 * 而不是依赖于顺序匹配键
 */
function createI18nStyleKeyMap(
  originalSchema: any,
  translatedSchema: any,
  keyMap: Record<string, string> = {}
): Record<string, string> {
  // 用于存储翻译后的键及其路径
  const translatedKeyPaths: Record<string, string> = {};
  
  // 首先提取翻译后的键路径
  extractKeyPaths(translatedSchema, translatedKeyPaths, '');
  
  // 然后创建原始键到翻译键的映射
  createKeyMapFromSchema(originalSchema, keyMap, translatedKeyPaths, '');
  
  return keyMap;
}

/**
 * 从schema中提取所有键的路径
 */
function extractKeyPaths(
  schema: any,
  keyPaths: Record<string, string>,
  currentPath: string
): void {
  if (!schema || typeof schema !== 'object' || schema.type !== 'object' || !schema.properties) {
    return;
  }
  
  // 处理对象的属性
  for (const [key, value] of Object.entries(schema.properties)) {
    const newPath = currentPath ? `${currentPath}.${key}` : key;
    
    // 存储键及其路径
    keyPaths[newPath] = key;
    
    // 递归处理嵌套对象
    if (value && typeof value === 'object') {
      const schemaValue = value as SchemaValue;
      
      if (schemaValue.type === 'object' && schemaValue.properties) {
        extractKeyPaths(schemaValue, keyPaths, newPath);
      } else if (schemaValue.type === 'array' && schemaValue.items && 
                 schemaValue.items.type === 'object') {
        extractKeyPaths(schemaValue.items, keyPaths, `${newPath}[]`);
      }
    }
  }
}

/**
 * 创建从原始键到翻译键的映射
 */
function createKeyMapFromSchema(
  schema: any,
  keyMap: Record<string, string>,
  translatedKeyPaths: Record<string, string>,
  currentPath: string
): void {
  if (!schema || typeof schema !== 'object' || schema.type !== 'object' || !schema.properties) {
    return;
  }
  
  // 处理对象的属性
  for (const [key, value] of Object.entries(schema.properties)) {
    const newPath = currentPath ? `${currentPath}.${key}` : key;
    
    // 查找对应的翻译键
    // 因为路径模式是相同的，所以可以直接查找翻译后的键
    if (translatedKeyPaths[newPath]) {
      keyMap[key] = translatedKeyPaths[newPath];
    }
    
    // 递归处理嵌套对象
    if (value && typeof value === 'object') {
      const schemaValue = value as SchemaValue;
      
      if (schemaValue.type === 'object' && schemaValue.properties) {
        createKeyMapFromSchema(schemaValue, keyMap, translatedKeyPaths, newPath);
      } else if (schemaValue.type === 'array' && schemaValue.items && 
                 schemaValue.items.type === 'object') {
        createKeyMapFromSchema(schemaValue.items, keyMap, translatedKeyPaths, `${newPath}[]`);
      }
    }
  }
} 