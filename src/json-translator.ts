import { generateKeySchema } from './schema-generator';
import { translateKeys } from './key-translator';
import { TranslationOptions, TranslationResult } from './types';

/**
 * Translates the keys in a JSON object to another language
 * @param json The JSON object to translate
 * @param options Translation options
 * @returns The translated JSON object and key mapping
 */
export async function translateJsonKeys(
  json: any,
  options: TranslationOptions = {}
): Promise<TranslationResult> {
  // Generate a JSON schema focused on keys
  const keySchema = generateKeySchema(json);
  
  // Translate the keys in the schema
  const { keyMap, translatedSchema } = await translateKeys(keySchema, options);
  
  // Apply the translated keys to the original JSON
  const translatedJson = applyTranslatedKeys(json, keyMap);
  
  return {
    translatedJson,
    keyMap
  };
}

/**
 * Applies a key mapping to a JSON object
 * @param json The original JSON object
 * @param keyMap Mapping from original to translated keys
 * @param preserveOriginal Whether to preserve original keys as values
 * @returns A new JSON object with translated keys
 */
export function applyTranslatedKeys(
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