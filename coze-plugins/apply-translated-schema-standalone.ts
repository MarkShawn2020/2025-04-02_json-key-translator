import { Args } from '@/runtime';

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
 * Helper function to extract key mappings by comparing original and translated schemas
 */
function extractKeyMappings(
  original: any, 
  translated: any, 
  keyMap: Record<string, string> = {},
  path: string = ''
): Record<string, string> {
  if (!original || !translated || typeof original !== 'object' || typeof translated !== 'object') {
    return keyMap;
  }
  
  if (original.type === 'object' && translated.type === 'object' &&
      original.properties && translated.properties) {
    
    const originalKeys = Object.keys(original.properties);
    const translatedKeys = Object.keys(translated.properties);
    
    // Map original keys to translated keys
    for (let i = 0; i < Math.min(originalKeys.length, translatedKeys.length); i++) {
      const originalKey = originalKeys[i];
      const translatedKey = translatedKeys[i];
      
      // Store the mapping
      keyMap[originalKey] = translatedKey;
      
      // Recursively process nested objects
      extractKeyMappings(
        original.properties[originalKey],
        translated.properties[translatedKey],
        keyMap,
        path ? `${path}.${originalKey}` : originalKey
      );
    }
  }
  
  if (original.type === 'array' && translated.type === 'array' &&
      original.items && translated.items) {
    // Recursively process array items
    extractKeyMappings(original.items, translated.items, keyMap, path ? `${path}[]` : '[]');
  }
  
  return keyMap;
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
    
    // 提取键映射，现在对比的是两个schema
    const keyMap = extractKeyMappings(
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