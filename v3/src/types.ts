export interface TranslationOptions {
  /**
   * The source language of the JSON keys
   * @default 'en'
   */
  sourceLanguage?: string;
  
  /**
   * The target language to translate JSON keys to
   * @default 'zh'
   */
  targetLanguage?: string;
  
  /**
   * Custom translation function
   * If provided, this function will be used instead of the default translation method
   */
  translationFn?: (schema: object, options: TranslationOptions) => Promise<object>;
  
  /**
   * Whether to preserve original keys as values
   * @default false
   */
  preserveOriginalKeys?: boolean;
  
  /**
   * Mapping from original keys to translated keys
   * Can be used to provide custom translations or to reuse previous translations
   */
  keyMap?: Record<string, string>;
}

export interface KeyMappingResult {
  /**
   * The original to translated key mapping
   */
  keyMap: Record<string, string>;
  
  /**
   * The translated JSON schema
   */
  translatedSchema: object;
}

export interface TranslationResult {
  /**
   * The original JSON object with translated keys
   */
  translatedJson: any;
  
  /**
   * The mapping from original keys to translated keys
   */
  keyMap: Record<string, string>;
} 