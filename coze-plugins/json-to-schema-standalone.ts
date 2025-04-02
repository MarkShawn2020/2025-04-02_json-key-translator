import { Args } from '@/runtime';

interface JsonToSchemaInput {
  /**
   * The JSON object to convert to schema
   */
  json: any;
}

interface JsonToSchemaOutput {
  /**
   * The JSON schema focused on keys
   */
  schema: object;
  
  /**
   * The original JSON (passed through for later use)
   */
  originalJson: any;
}

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

/**
 * Converts a JSON object to a schema focused on keys.
 * This is useful for extracting structure for translation.
 * 
 * @param {Object} args.input - The JSON object to convert
 * @param {Object} args.logger - Logger instance injected by runtime
 * @returns {Object} The schema and original JSON
 */
export async function handler({ 
  input, 
  logger 
}: Args<JsonToSchemaInput>): Promise<JsonToSchemaOutput> {
  
  logger.info('Converting JSON to schema...');
  
  try {
    // Generate a schema focused on keys from the input JSON
    const schema = generateKeySchema(input.json);
    
    logger.info('Successfully generated schema');
    
    // Return both the schema and the original JSON (for later use)
    return {
      schema,
      originalJson: input.json
    };
  } catch (error) {
    logger.error('Error generating schema:', error);
    throw error;
  }
} 