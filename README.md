# JSON Key Translator

A Node.js library to translate JSON keys between languages.

## Features

- Translate JSON keys from English to any language
- Support for deep nested JSON structures
- DeepSeek AI integration for high-quality translations
- Fully typed with TypeScript
- Simple API for easy integration

## Installation

```bash
npm install json-key-translator
```

## Usage

### Basic Usage

```typescript
import { translateKeys, transformJson } from 'json-key-translator';

// Your JSON object with English keys
const englishJson = {
  user: {
    firstName: 'John',
    lastName: 'Doe',
    address: {
      street: '123 Main St',
      city: 'Anytown'
    }
  }
};

// Translate the keys
const result = await translateKeys(englishJson, {
  sourceLanguage: 'en',
  targetLanguage: 'zh'
});

// The result contains:
// 1. keyMap: Mapping between original and translated keys
// 2. translatedJson: The JSON with translated keys

console.log(result.keyMap);
// Example output:
// {
//   user: '用户',
//   firstName: '名',
//   lastName: '姓',
//   address: '地址',
//   street: '街道',
//   city: '城市'
// }

console.log(result.translatedJson);
// Example output:
// {
//   用户: {
//     名: 'John',
//     姓: 'Doe',
//     地址: {
//       街道: '123 Main St',
//       城市: 'Anytown'
//     }
//   }
// }
```

### Using DeepSeek AI for Translation

```typescript
import { translateKeys, createDeepSeekTranslator } from 'json-key-translator';

// Create a DeepSeek translator with your API key
const deepSeekTranslator = createDeepSeekTranslator({
  apiKey: 'your-deepseek-api-key'
});

// Your JSON object with English keys
const englishJson = {
  user: {
    firstName: 'John',
    lastName: 'Doe'
  }
};

// Translate using DeepSeek
const result = await translateKeys(englishJson, {
  sourceLanguage: 'en',
  targetLanguage: 'zh',
  translationFn: deepSeekTranslator
});

console.log(result.translatedJson);
```

### Working with Existing Key Mappings

If you already have a key mapping that you want to extend:

```typescript
import { translateKeys } from 'json-key-translator';

// Existing key mapping
const existingKeyMap = {
  user: '用户',
  firstName: '名'
};

// New JSON with additional keys
const newJson = {
  user: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
  }
};

// Translate, extending the existing key map
const result = await translateKeys(newJson, {
  sourceLanguage: 'en',
  targetLanguage: 'zh',
  keyMap: existingKeyMap
});

// The result.keyMap will include the original mappings plus new ones
```

### Manually Transforming JSON

If you have a key mapping and want to apply it to a JSON object:

```typescript
import { transformJson } from 'json-key-translator';

const keyMap = {
  user: '用户',
  firstName: '名',
  lastName: '姓'
};

const englishJson = {
  user: {
    firstName: 'John',
    lastName: 'Doe'
  }
};

const chineseJson = transformJson(englishJson, keyMap);

console.log(chineseJson);
// {
//   用户: {
//     名: 'John',
//     姓: 'Doe'
//   }
// }
```

## API Reference

### translateKeys(json, options)

Translates the keys of a JSON object.

**Parameters:**

- `json` (Object): The JSON object to translate
- `options` (TranslationOptions): Options for translation
  - `sourceLanguage` (string): Source language code (default: 'en')
  - `targetLanguage` (string): Target language code (default: 'zh')
  - `translationFn` (Function): Custom translation function
  - `keyMap` (Object): Existing key map to extend
  - `mode` (string): 'data' (default) or 'schema'

**Returns:**

- `KeyMappingResult`: Object containing the key mapping and translated JSON

### transformJson(json, keyMap, options)

Applies a key mapping to transform a JSON object.

**Parameters:**

- `json` (Object): The JSON object to transform
- `keyMap` (Object): Mapping of original keys to translated keys
- `options` (TransformOptions): Options for transformation
  - `deep` (boolean): Whether to transform nested objects (default: true)
  - `transformArrays` (boolean): Whether to transform array items (default: true)

**Returns:**

- Transformed JSON object

### createDeepSeekTranslator(config)

Creates a translation function that uses DeepSeek AI.

**Parameters:**

- `config` (DeepSeekConfig): Configuration for DeepSeek AI
  - `apiKey` (string): DeepSeek API key
  - `apiEndpoint` (string): API endpoint (optional)
  - `model` (string): Model to use (optional)
  - `temperature` (number): Generation temperature (optional)

**Returns:**

- Translation function compatible with `translateKeys`

## License

MIT 