import { Args } from '@/runtime';

// 添加类型定义
interface SchemaValue {
  type: string;
  properties?: Record<string, SchemaValue>;
  items?: SchemaValue;
  [key: string]: any;
}

interface ApplyTranslationInput {
  /**
   * The original JSON object
   */
  originalJson: any;
  
  /**
   * The translated schema with translated keys
   */
  translatedSchema: object;
  
  /**
   * Whether to preserve original keys alongside translated ones
   */
  preserveOriginalKeys?: boolean;
}

interface ApplyTranslationOutput {
  /**
   * The JSON with translated keys
   */
  translatedJson: any;
  
  /**
   * The mapping from original to translated keys
   */
  keyMap: Record<string, string>;
}

/**
 * 生成JSON schema，专注于结构和键
 */
function generateKeySchema(json: any): object {
  return toJsonSchema(json);
}

/**
 * 简单的JSON到schema转换
 */
function toJsonSchema(obj: any): any {
  if (obj === null || obj === undefined) {
    return { type: 'null' };
  }
  
  const type = Array.isArray(obj) ? 'array' : typeof obj;
  
  switch (type) {
    case 'string':
      return { type: 'string' };
    case 'number':
      return { type: 'number' };
    case 'boolean':
      return { type: 'boolean' };
    case 'array': {
      if (obj.length === 0) {
        return { 
          type: 'array',
          items: { type: 'null' }
        };
      }
      
      // 使用第一个元素确定数组类型
      const itemSchema = toJsonSchema(obj[0]);
      return {
        type: 'array',
        items: itemSchema
      };
    }
    case 'object': {
      const properties: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(obj)) {
        properties[key] = toJsonSchema(value);
      }
      
      return {
        type: 'object',
        properties
      };
    }
    default:
      return { type: 'string' };
  }
}

/**
 * Applies a key mapping to a JSON object
 */
function applyTranslatedKeys(
  json: any, 
  keyMap: Record<string, string>,
  preserveOriginal: boolean = false
): any {
  if (json === null || json === undefined) {
    return json;
  }
  
  // Handle array case
  if (Array.isArray(json)) {
    return json.map(item => applyTranslatedKeys(item, keyMap, preserveOriginal));
  }
  
  // Handle object case
  if (typeof json === 'object') {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(json)) {
      const translatedKey = keyMap[key] || key;
      
      if (preserveOriginal && key !== translatedKey) {
        // Store original value under the original key if requested
        result[key] = value;
      }
      
      // Process nested objects recursively
      result[translatedKey] = applyTranslatedKeys(value, keyMap, preserveOriginal);
    }
    
    return result;
  }
  
  // Return primitive values as is
  return json;
}

/**
 * 创建类似于i18n风格的键映射，使用完整路径作为键
 * 而不是依赖于顺序匹配键
 */
function createI18nStyleKeyMap(
  originalSchema: any,
  translatedSchema: any
): Record<string, string> {
  // 用于存储键映射关系的对象
  const keyMap: Record<string, string> = {};
  
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
    // 因为路径模式是相同的，所以可以直接查找
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

/**
 * Applies a translated schema back to the original JSON.
 * 
 * @param {Object} args.input - The original JSON and translated schema
 * @param {Object} args.logger - Logger instance injected by runtime
 * @returns {Object} The translated JSON and key mapping
 */
export async function handler({ 
  input, 
  logger 
}: Args<ApplyTranslationInput>): Promise<ApplyTranslationOutput> {
  
  logger.info('Applying translated schema to original JSON...');
  
  try {
    // 先将原始JSON转换为schema格式
    const originalSchema = generateKeySchema(input.originalJson);
    
    // 使用i18n风格的键映射方法，不依赖键的顺序
    const keyMap = createI18nStyleKeyMap(
      originalSchema,
      input.translatedSchema
    );
    
    logger.info('Key mapping extracted');
    
    // 将翻译后的键应用到原始JSON
    const translatedJson = applyTranslatedKeys(
      input.originalJson, 
      keyMap, 
      input.preserveOriginalKeys || false
    );
    
    logger.info('Successfully applied translated keys');
    
    return {
      translatedJson,
      keyMap
    };
  } catch (error) {
    logger.error('Error applying translations:', error);
    throw error;
  }
} 