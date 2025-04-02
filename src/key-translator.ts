import { KeyMappingResult, TranslationOptions, TransformOptions } from './types';

// Utility type for JSON values
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

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
async function defaultTranslationFn(json: any, options: TranslationOptions): Promise<any> {
  console.log('Using default translation function - in real use, this would call an LLM API');
  // This is just a placeholder that doesn't do any actual translation
  return json;
}

/**
 * Translates the keys in a JSON object
 * @param json The JSON object to translate
 * @param options Translation options
 * @returns The translated key mapping and translated JSON
 */
export async function translateKeys(json: any, options: TranslationOptions = {}): Promise<KeyMappingResult> {
  const {
    sourceLanguage = 'en',
    targetLanguage = 'zh',
    translationFn = defaultTranslationFn,
    keyMap: existingKeyMap = {},
    mode = 'data'
  } = options;
  
  // Clone the existing key map to avoid modifying the input
  const keyMap = { ...existingKeyMap };
  
  // Extract all keys from the JSON object
  const keysToTranslate = extractKeysFromJson(json, mode);
  
  // Prepare a JSON object with just the keys for translation
  const keysForTranslation = prepareKeysForTranslation(keysToTranslate);
  
  // Use provided translation function
  const translatedKeys = await translationFn(keysForTranslation, {
    sourceLanguage, 
    targetLanguage,
    mode
  });
  
  // Process translated keys to create the key mapping
  processTranslatedKeys(keysToTranslate, translatedKeys, keyMap);
  
  // Apply the key mapping to the original JSON to create translated JSON
  const translatedJson = transformJson(json, keyMap);
  
  return {
    keyMap,
    translatedJson
  };
}

/**
 * Extract all keys from a JSON object
 * @param json The JSON object
 * @param mode The processing mode
 * @returns Array of keys
 */
export function extractKeysFromJson(json: any, mode: string): string[] {
  const keys = new Set<string>();
  
  function extractKeys(obj: any, parentKey: string = '') {
    if (!obj || typeof obj !== 'object') return;
    
    // For arrays, process each item
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        extractKeys(item, `${parentKey}[${index}]`);
      });
      return;
    }
    
    // For objects, extract each key
    for (const key of Object.keys(obj)) {
      if (mode === 'schema' && key === 'type') continue; // Skip type keys in schema mode
      
      keys.add(key);
      extractKeys(obj[key], `${parentKey}.${key}`);
    }
  }
  
  extractKeys(json);
  return Array.from(keys);
}

/**
 * Prepare keys for translation by creating a structured object
 * @param keys Array of keys to translate
 * @returns Object with keys organized for translation
 */
function prepareKeysForTranslation(keys: string[]): any {
  return {
    keys,
    _metadata: {
      type: 'key-translation-request',
      count: keys.length
    }
  };
}

/**
 * Process translated keys to create a key mapping
 * @param originalKeys Original keys
 * @param translatedKeys Translated keys object
 * @param keyMap Key mapping to update
 */
function processTranslatedKeys(
  originalKeys: string[],
  translatedKeys: any,
  keyMap: Record<string, string>
): void {
  // If the translation function returned an array of translated keys in the same order
  if (Array.isArray(translatedKeys) && translatedKeys.length === originalKeys.length) {
    originalKeys.forEach((key, index) => {
      keyMap[key] = translatedKeys[index];
    });
    return;
  }
  
  // If the translation function returned an object with a keys property
  if (translatedKeys && Array.isArray(translatedKeys.keys) && 
      translatedKeys.keys.length === originalKeys.length) {
    originalKeys.forEach((key, index) => {
      keyMap[key] = translatedKeys.keys[index];
    });
    return;
  }
  
  // If the translation function returned a direct mapping
  if (translatedKeys && typeof translatedKeys === 'object') {
    for (const key of originalKeys) {
      if (translatedKeys[key]) {
        keyMap[key] = translatedKeys[key];
      }
    }
  }
}

/**
 * Transform a JSON object by applying key mapping
 * @param json The JSON object to transform
 * @param keyMap The key mapping to apply
 * @param options Transform options
 * @returns Transformed JSON
 */
export function transformJson(
  json: any, 
  keyMap: Record<string, string>,
  options: TransformOptions = {}
): any {
  const { deep = true, transformArrays = true } = options;
  
  if (!json || typeof json !== 'object') {
    return json;
  }
  
  // Handle arrays
  if (Array.isArray(json)) {
    if (!transformArrays) return json;
    return deep ? json.map(item => transformJson(item, keyMap, options)) : [...json];
  }
  
  // Handle objects
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(json)) {
    // Always transform the current level keys
    const newKey = keyMap[key] || key;
    
    if (deep && typeof value === 'object' && value !== null) {
      // Deep transformation for nested objects if deep is true
      result[newKey] = transformJson(value, keyMap, options);
    } else {
      // For deep=false or non-object values, just copy the value without transformation
      result[newKey] = value;
    }
  }
  
  return result;
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