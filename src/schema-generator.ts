import toJsonSchema from 'to-json-schema';

/**
 * Extracts only the keys from a JSON object, removing any complex values
 * @param json The JSON object to process
 * @returns A JSON schema focused only on the structure and keys
 */
export function generateKeySchema(json: any): object {
  // Generate a JSON schema from the input
  const schema = toJsonSchema(json, {
    required: false,
    arrays: {
      mode: 'first' // Only use the first item in arrays for schema generation
    }
  });
  
  // Remove unnecessary schema properties to focus only on keys
  return simplifySchema(schema);
}

/**
 * Simplifies a JSON schema to focus only on structure and keys
 * @param schema The JSON schema to simplify
 * @returns A simplified schema with only structure information
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