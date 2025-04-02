# Integration with Coze Platform

This guide explains how to integrate the `json-key-translator` library with Coze workflows.

## Overview

Since Coze allows you to build AI workflows but might not directly support npm packages, we need to split the JSON translation process into separate steps that can be handled by Coze's components.

## Step-by-Step Guide

### Step 1: Extract JSON Schema

In your custom JavaScript node in Coze, use the following code to generate the JSON schema:

```javascript
// Import the schema generation function
const { generateKeySchema } = require('json-key-translator');

function onInputReceived(params) {
  const inputJson = params.json; // Assuming the JSON is passed to the node

  // Generate schema with focus on keys
  const keySchema = generateKeySchema(inputJson);
  
  // Pass the schema to the next node
  return {
    schema: keySchema,
    originalJson: inputJson
  };
}
```

### Step 2: Translate Schema with LLM

Use a Coze LLM node to translate the schema. Configure your prompt like this:

```
I need you to translate the keys in this JSON schema from English to Chinese.
Only translate the keys, not the values or structure.
Keep the same JSON structure, just return a new JSON with translated keys.

Here's the schema:
{{context.schema}}

Return only the translated JSON schema with no additional text.
```

### Step 3: Apply Translated Keys

In another JavaScript node, apply the translated schema back to the original JSON:

```javascript
// Import the key mapping extraction and application functions
const { applyTranslatedKeys } = require('json-key-translator');

function onInputReceived(params) {
  const originalJson = params.originalJson;
  const translatedSchema = params.translatedSchema; // From LLM node
  
  // Extract key mappings
  const keyMap = extractKeyMappings(originalJson, translatedSchema);
  
  // Apply translations
  const translatedJson = applyTranslatedKeys(originalJson, keyMap);
  
  return {
    result: translatedJson,
    keyMap: keyMap
  };
}

// Helper function to extract key mappings
function extractKeyMappings(original, translated, keyMap = {}, path = '') {
  if (!original || !translated || typeof original !== 'object' || typeof translated !== 'object') {
    return keyMap;
  }
  
  if (original.type === 'object' && translated.type === 'object' &&
      original.properties && translated.properties) {
    
    const originalKeys = Object.keys(original.properties);
    const translatedKeys = Object.keys(translated.properties);
    
    for (let i = 0; i < Math.min(originalKeys.length, translatedKeys.length); i++) {
      const originalKey = originalKeys[i];
      const translatedKey = translatedKeys[i];
      
      keyMap[originalKey] = translatedKey;
      
      extractKeyMappings(
        original.properties[originalKey],
        translated.properties[translatedKey],
        keyMap,
        path ? `${path}.${originalKey}` : originalKey
      );
    }
  }
  
  if (original.type === 'array' && translated.type === 'array' &&
      original.items && translated.items) {
    extractKeyMappings(original.items, translated.items, keyMap, path ? `${path}[]` : '[]');
  }
  
  return keyMap;
}
```

## Complete Workflow

1. **Input Node**: Receives JSON data
2. **Schema Generation Node**: JavaScript code to extract schema
3. **LLM Translation Node**: Translates the schema
4. **Key Application Node**: Applies translated keys to original JSON
5. **Output Node**: Returns translated JSON and key mapping

## Notes

- Make sure your Coze environment has permissions to import npm packages or copy the necessary functions directly into your code.
- Consider pre-processing very large JSON objects to avoid hitting token limits in the LLM.
- If needed, split complex translations into multiple LLM calls.

## Example Coze Configuration

```json
{
  "name": "JSON Key Translator Workflow",
  "nodes": [
    {
      "id": "input",
      "type": "input",
      "data": {
        "name": "JSON Input"
      }
    },
    {
      "id": "schema-gen",
      "type": "javascript",
      "data": {
        "code": "// Schema generation code here"
      }
    },
    {
      "id": "translate",
      "type": "llm",
      "data": {
        "model": "deepseek-chat",
        "prompt": "// Translation prompt here"
      }
    },
    {
      "id": "apply-keys",
      "type": "javascript",
      "data": {
        "code": "// Key application code here"
      }
    },
    {
      "id": "output",
      "type": "output",
      "data": {
        "name": "Translated JSON"
      }
    }
  ],
  "edges": [
    { "source": "input", "target": "schema-gen" },
    { "source": "schema-gen", "target": "translate" },
    { "source": "translate", "target": "apply-keys" },
    { "source": "apply-keys", "target": "output" }
  ]
}
``` 