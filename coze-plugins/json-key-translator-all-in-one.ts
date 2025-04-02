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
      
      // Extract key mapping
      const keyMap = extractKeyMappings(
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