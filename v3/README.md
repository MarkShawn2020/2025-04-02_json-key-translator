# json-key-translator

A Node.js library for translating JSON keys between languages.

## Features

- Convert JSON objects to JSON schema with a focus on keys
- Translate JSON keys from one language to another using LLMs or custom functions
- Apply translated keys back to the original JSON structure
- Support for preserving original keys alongside translated ones
- Support for custom translation functions
- Support for reusing previous translations with key maps
- **I18n-style key mapping** for precise and reliable translations

## Key Concepts

### I18n-Style Key Mapping

This library uses an internationalization (i18n) style approach to key mapping, which offers several benefits:

1. **Path-based mapping**: Keys are mapped based on their path in the JSON structure, not their order or position
2. **Reliable translations**: Even if keys are reordered or structures change slightly, the mapping remains accurate
3. **Context-aware**: The full path provides context for translation, helping when the same key name appears in different contexts

Traditional position-based mapping can lead to errors when:
- Keys are reordered during translation
- Some keys are skipped or added
- The structure changes slightly

Our i18n approach maps keys based on their semantic path (like `user.contact.email`), ensuring accurate translations regardless of order.

## Installation

```bash
npm install json-key-translator
```

## Usage

### Basic Translation

```typescript
import { translateJsonKeys } from 'json-key-translator';

const json = {
  name: 'John Doe',
  age: 30,
  contact: {
    email: 'john.doe@example.com',
    phone: '123-456-7890'
  },
  interests: ['programming', 'music', 'sports']
};

// Translate keys from English to Chinese
const { translatedJson, keyMap } = await translateJsonKeys(json, {
  sourceLanguage: 'en',
  targetLanguage: 'zh'
});

console.log(translatedJson);
// Output (example):
// {
//   姓名: 'John Doe',
//   年龄: 30,
//   联系方式: {
//     电子邮件: 'john.doe@example.com',
//     电话: '123-456-7890'
//   },
//   兴趣: ['programming', 'music', 'sports']
// }

console.log(keyMap);
// Output:
// {
//   name: '姓名',
//   age: '年龄',
//   contact: '联系方式',
//   email: '电子邮件',
//   phone: '电话',
//   interests: '兴趣'
// }
```

### Custom Translation Function

```typescript
import { translateJsonKeys } from 'json-key-translator';

// Custom function using an external API
async function myTranslationFn(schema, options) {
  // In a real scenario, this would call an LLM API (e.g., deepseek)
  // For now, we'll just simulate it with a hardcoded translation
  return {
    type: 'object',
    properties: {
      姓名: { type: 'string' },
      年龄: { type: 'number' },
      联系方式: {
        type: 'object',
        properties: {
          电子邮件: { type: 'string' },
          电话: { type: 'string' }
        }
      },
      兴趣: { type: 'array', items: { type: 'string' } }
    }
  };
}

const json = {
  name: 'John Doe',
  age: 30,
  contact: {
    email: 'john.doe@example.com',
    phone: '123-456-7890'
  },
  interests: ['programming', 'music', 'sports']
};

const result = await translateJsonKeys(json, {
  translationFn: myTranslationFn
});

console.log(result.translatedJson);
```

### Reuse Previous Translations

```typescript
import { translateJsonKeys } from 'json-key-translator';

// Key mapping from previous translation
const existingKeyMap = {
  name: '姓名',
  age: '年龄',
  contact: '联系方式',
  email: '电子邮件',
  phone: '电话',
  interests: '兴趣'
};

const json = {
  name: 'Jane Smith',
  age: 25,
  contact: {
    email: 'jane.smith@example.com',
    phone: '987-654-3210'
  },
  interests: ['reading', 'travel'],
  // New field not in the existing key map
  occupation: 'Engineer'
};

const result = await translateJsonKeys(json, {
  keyMap: existingKeyMap
});

console.log(result.translatedJson);
// The 'occupation' field would be translated by the LLM
// All other fields would use the existing key map
```

### Step-by-Step Processing

If you need more control over the translation process, you can use the individual functions:

```typescript
import { 
  generateKeySchema, 
  translateKeys, 
  applyTranslatedKeys 
} from 'json-key-translator';

const json = {
  name: 'John Doe',
  age: 30
};

// Step 1: Generate a schema focusing on keys
const schema = generateKeySchema(json);

// Step 2: Translate the keys
const { keyMap, translatedSchema } = await translateKeys(schema);

// Step 3: Apply the translated keys to the original JSON
const translatedJson = applyTranslatedKeys(json, keyMap);
```

## Integration with Coze

This library is designed to be easily integrated with the Coze platform. You can use the step-by-step approach to implement the translation in a Coze workflow:

1. Use `generateKeySchema` to extract only the keys from your JSON
2. Pass the schema to a Coze language model node for translation
3. Use `applyTranslatedKeys` to update your original JSON with the translated keys

## License

MIT 