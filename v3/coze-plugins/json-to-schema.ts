import { Args } from '@/runtime';
import { generateKeySchema } from 'json-key-translator';

interface JsonToSchemaInput {
  /**
   * The JSON object to convert to schema
   */
  json: string;
}

interface JsonToSchemaOutput {
  /**
   * The JSON schema focused on keys, as a JSON string
   */
  schema: string;
}

/**
 * Converts a JSON object to a schema focused on keys.
 * This is useful for extracting structure for translation.
 * 
 * @param {Object} args.input - Contains the JSON string to convert
 * @param {Object} args.logger - Logger instance injected by runtime
 * @returns {Object} The schema as a JSON string
 */
export async function handler({ 
  input, 
  logger 
}: Args<JsonToSchemaInput>): Promise<JsonToSchemaOutput> {
  
  logger.info('Converting JSON to schema...');
  
  try {
    // Parse the input JSON string into an object
    const jsonObject = JSON.parse(input.json);
    
    // Generate a schema focused on keys from the parsed JSON object
    const schema = generateKeySchema(jsonObject);
    
    // Convert schema to JSON string
    const schemaString = JSON.stringify(schema);
    
    logger.info('Successfully generated schema');
    
    return {
      schema: schemaString
    };
  } catch (error) {
    logger.error('Error generating schema:', error);
    throw error;
  }
} 