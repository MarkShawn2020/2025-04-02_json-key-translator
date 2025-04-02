import { Args } from '@/runtime';
import { generateKeySchema } from 'json-key-translator';

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