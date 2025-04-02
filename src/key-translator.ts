import { KeyMappingResult, TranslationOptions } from './types';

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
  
  // Extract key mappings from translated schema
  extractKeyMappings(schema, translatedSchema, keyMap, '');
  
  return {
    keyMap,
    translatedSchema
  };
}

/**
 * Recursively extracts key mappings by comparing original and translated schemas
 */
function extractKeyMappings(
  original: any, 
  translated: any, 
  keyMap: Record<string, string>,
  path: string
): void {
  if (!original || !translated || typeof original !== 'object' || typeof translated !== 'object') {
    return;
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
} 