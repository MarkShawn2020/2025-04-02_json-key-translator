/**
 * Options for translation
 */
export interface TranslationOptions {
  /**
   * Source language (default: 'en')
   */
  sourceLanguage?: string;
  
  /**
   * Target language (default: 'zh')
   */
  targetLanguage?: string;
  
  /**
   * Custom translation function
   * If not provided, will use the default translator
   */
  translationFn?: (json: any, options: TranslationOptions) => Promise<any>;
  
  /**
   * Existing key map to extend
   */
  keyMap?: Record<string, string>;

  /**
   * Mode for handling JSON structure
   * - 'schema': Uses JSON schema format with type information (default)
   * - 'data': Translates keys in regular JSON data
   */
  mode?: 'schema' | 'data';
}

/**
 * Result of key translation
 */
export interface KeyMappingResult {
  /**
   * Map of original keys to translated keys
   */
  keyMap: Record<string, string>;
  
  /**
   * The translated schema or data
   */
  translatedJson: any;
}

/**
 * Function to apply key mapping to transform JSON data
 */
export interface TransformFunction {
  (json: any, keyMap: Record<string, string>, options?: TransformOptions): any;
}

/**
 * Options for transforming JSON with a key map
 */
export interface TransformOptions {
  /**
   * Whether to transform deeply nested objects
   * Default: true
   */
  deep?: boolean;
  
  /**
   * Whether to transform array item keys
   * Default: true
   */
  transformArrays?: boolean;
} 