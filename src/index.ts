// Export public API
import { translateJsonKeys, applyTranslatedKeys } from './json-translator';
import { generateKeySchema } from './schema-generator';
import { translateKeys } from './key-translator';
import { TranslationOptions, TranslationResult, KeyMappingResult } from './types';

// Main translation function
export { translateJsonKeys };

// Utility functions for step-by-step processing
export { 
  generateKeySchema,
  translateKeys,
  applyTranslatedKeys
};

// Type definitions
export type {
  TranslationOptions,
  TranslationResult,
  KeyMappingResult
}; 