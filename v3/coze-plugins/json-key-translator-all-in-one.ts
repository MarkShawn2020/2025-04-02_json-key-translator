import { Args } from '@/runtime';

// Input/Output types for the plugin
interface JsonTranslatorInput {
  /**
   * The JSON object to translate
   */
  json: any;
  
  /**
   * Operation to perform: "generateSchema" or "applyTranslation"
   */
  operation: 'generateSchema' | 'applyTranslation';
  
  /**
   * Translated schema (only needed for applyTranslation operation)
   */
  translatedSchema?: object;
  
  /**
   * Whether to preserve original keys (only for applyTranslation)
   */
  preserveOriginalKeys?: boolean;
}

interface JsonTranslatorOutput {
  /**
   * The result of the operation
   */
  result: any;
  
  /**
   * Original JSON (for chaining operations)
   */
  originalJson?: any;
  
  /**
   * Key mapping (only for applyTranslation)
   */
  keyMap?: Record<string, string>;
}

// JSON Schema Generation Functions

/**
 * Generates a JSON schema focused on keys from a JSON object
 */
function generateKeySchema(json: any): object {
  // Generate a simple JSON schema from the input
  const schema = toJsonSchema(json);
  
  // Remove unnecessary schema properties to focus only on keys
  return simplifySchema(schema);
}

/**
 * Simple implementation of JSON to schema conversion
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
      
      // Use the first item to determine the array type
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
 * Simplifies a JSON schema to focus only on structure and keys
 */
function simplifySchema(schema: any): object {
  if (!schema || typeof schema !== 'object') {
    return schema;
  }
  
  // Handle array type
  if (schema.type === 'array' && schema.items) {
    return {
      type: 'array',
      items: simplifySchema(schema.items)
    };
  }
  
  // Handle object type
  if (schema.type === 'object' && schema.properties) {
    const simplifiedProperties: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(schema.properties)) {
      simplifiedProperties[key] = simplifySchema(value);
    }
    
    return {
      type: 'object',
      properties: simplifiedProperties
    };
  }
  
  // For primitive types, just return the type
  return { type: schema.type };
}

// Translation Application Functions

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
  if (!schema || schema.type !== 'object' || !schema.properties) {
    return;
  }
  
  // 处理对象的属性
  for (const [key, value] of Object.entries(schema.properties)) {
    const newPath = currentPath ? `${currentPath}.${key}` : key;
    
    // 存储类型信息和路径
    keyPaths[newPath] = key;
    
    // 递归处理嵌套对象
    if (value && typeof value === 'object') {
      if (value.type === 'object' && value.properties) {
        extractKeyPaths(value, keyPaths, newPath);
      } else if (value.type === 'array' && value.items && value.items.type === 'object') {
        extractKeyPaths(value.items, keyPaths, `${newPath}[]`);
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
  if (!schema || schema.type !== 'object' || !schema.properties) {
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
      if (value.type === 'object' && value.properties) {
        createKeyMapFromSchema(value, keyMap, translatedKeyPaths, newPath);
      } else if (value.type === 'array' && value.items && value.items.type === 'object') {
        createKeyMapFromSchema(value.items, keyMap, translatedKeyPaths, `${newPath}[]`);
      }
    }
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
 * A combined handler that supports both schema generation and translation application
 * 
 * @param {Object} args.input - Input parameters
 * @param {Object} args.logger - Logger instance injected by runtime
 * @returns {Object} Result based on the requested operation
 */
export async function handler({ 
  input, 
  logger 
}: Args<JsonTranslatorInput>): Promise<JsonTranslatorOutput> {
  
  logger.info(`Performing operation: ${input.operation}`);
  
  try {
    // Handle schema generation
    if (input.operation === 'generateSchema') {
      logger.info('Generating JSON schema...');
      
      const schema = generateKeySchema(input.json);
      
      logger.info('Schema generation successful');
      
      return {
        result: schema,
        originalJson: input.json
      };
    }
    
    // Handle translation application
    if (input.operation === 'applyTranslation') {
      if (!input.translatedSchema) {
        throw new Error('translatedSchema is required for applyTranslation operation');
      }
      
      logger.info('Applying translation to JSON...');
      
      // 无需从输入获取原始schema，直接生成
      const originalSchema = generateKeySchema(input.json);
      
      // 使用i18n风格的键映射方法，不依赖键的顺序
      const keyMap = createI18nStyleKeyMap(
        originalSchema,
        input.translatedSchema
      );
      
      logger.info('Key mapping extracted');
      
      // Apply the translations
      const translatedJson = applyTranslatedKeys(
        input.json,
        keyMap,
        input.preserveOriginalKeys || false
      );
      
      logger.info('Translation applied successfully');
      
      return {
        result: translatedJson,
        keyMap
      };
    }
    
    // Handle invalid operation
    throw new Error(`Invalid operation: ${input.operation}`);
    
  } catch (error) {
    logger.error('Error during operation:', error);
    throw error;
  }
} 