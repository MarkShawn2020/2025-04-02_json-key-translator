import { TranslationOptions } from './types';

/**
 * Configuration for DeepSeek AI API
 */
export interface DeepSeekConfig {
  /**
   * API key for DeepSeek AI
   */
  apiKey: string;
  
  /**
   * API endpoint (default: 'https://api.deepseek.com/v1/chat/completions')
   */
  apiEndpoint?: string;

  /**
   * Model to use (default: 'deepseek-chat')
   */
  model?: string;

  /**
   * Temperature for generation (default: 0.2)
   */
  temperature?: number;
}

/**
 * Create a translation function that uses DeepSeek AI
 * @param config DeepSeek AI configuration
 * @returns A translation function
 */
export function createDeepSeekTranslator(config: DeepSeekConfig) {
  const {
    apiKey,
    apiEndpoint = 'https://api.deepseek.com/v1/chat/completions',
    model = 'deepseek-chat',
    temperature = 0.2
  } = config;

  /**
   * Translate keys using DeepSeek AI
   * @param json JSON object with keys to translate
   * @param options Translation options
   * @returns Translated keys
   */
  return async function deepSeekTranslate(json: any, options: TranslationOptions): Promise<any> {
    const { sourceLanguage = 'en', targetLanguage = 'zh' } = options;
    
    // Extract the keys to translate from the input JSON
    const keys = json.keys || Object.keys(json);
    
    // Skip translation if no keys
    if (!keys.length) {
      return json;
    }
    
    // Create the prompt for DeepSeek
    const prompt = createTranslationPrompt(keys, sourceLanguage, targetLanguage);
    
    try {
      // Call DeepSeek AI API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a professional translator specializing in technical terminology and variable names.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature,
          response_format: { type: 'json_object' }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`DeepSeek API error (${response.status}): ${errorData}`);
      }
      
      const result = await response.json();
      const translatedContent = result.choices[0].message.content;
      
      // Parse the JSON response
      const translatedData = JSON.parse(translatedContent);
      
      // Return the translations in the format expected by the translator
      return {
        keys: translatedData.translations
      };
    } catch (error) {
      console.error('Error translating with DeepSeek:', error);
      throw error;
    }
  };
}

/**
 * Create a prompt for translating keys
 * @param keys Array of keys to translate
 * @param sourceLanguage Source language
 * @param targetLanguage Target language
 * @returns A prompt string for the AI
 */
function createTranslationPrompt(
  keys: string[],
  sourceLanguage: string,
  targetLanguage: string
): string {
  return `
Translate the following ${sourceLanguage} JSON keys into ${targetLanguage}. 
These are variable names or object property names from a JSON structure, so translate them appropriately for a programming context.
Return only a JSON object with a "translations" array containing the translated keys in the same order.

Keys to translate:
${JSON.stringify(keys, null, 2)}

Please follow these guidelines:
1. Keep the translations concise and appropriate for variable/property names
2. Do not use spaces in the translations
3. Use camelCase for multi-word translations
4. Preserve technical terms when appropriate
5. If a key should not be translated (like "id", "API", etc.), keep it as is

Your response should be a valid JSON object like this:
{
  "translations": ["translatedKey1", "translatedKey2", ...]
}
`.trim();
} 