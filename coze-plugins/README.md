# JSON Key Translator for Coze

This directory contains plugins for Coze to enable JSON key translation within Coze workflows.

## Overview

The translation process is split into 3 steps:

1. **JSON to Schema**: Convert a JSON object to a schema focused on keys
2. **Schema Translation**: Translate the schema keys (handled by Coze LLM)
3. **Apply Translation**: Apply the translated schema back to the original JSON

## Plugins

We provide three plugin options:

### Option 1: Standalone Single-Purpose Plugins

- `json-to-schema-standalone.ts`: Converts JSON to schema
- `apply-translated-schema-standalone.ts`: Applies translated schema to original JSON

### Option 2: All-in-One Plugin

- `json-key-translator-all-in-one.ts`: Handles both schema generation and translation application in a single plugin with operation selection

All plugins are self-contained and don't require external dependencies.

## Usage in Coze

### Using Separate Plugins

1. **Add the plugins to your Coze workspace**:
   Copy the plugin files to your Coze workspace.

2. **Create a workflow**:
   
   a. **Input Node**: Accepts the JSON to translate.
   
   b. **JSON to Schema Node**: Uses the `json-to-schema-standalone.ts` plugin to generate a schema.
   
   c. **LLM Translation Node**: Uses Coze's LLM with a prompt like:
   ```
   I need you to translate the keys in this JSON schema from English to Chinese.
   Only translate the keys, not the values or structure.
   Keep the same JSON structure, just return a new JSON with translated keys.

   Here's the schema:
   {{context.schema}}

   Return only the translated JSON schema with no additional text.
   ```
   
   d. **Apply Translation Node**: Uses the `apply-translated-schema-standalone.ts` plugin to apply the translated schema.
   
   e. **Output Node**: Returns the translated JSON and key mappings.

### Using All-in-One Plugin

1. **Add the all-in-one plugin to your Coze workspace**:
   Copy `json-key-translator-all-in-one.ts` to your Coze workspace.

2. **Create a workflow**:
   
   a. **Input Node**: Accepts the JSON to translate.
   
   b. **Schema Generation Node**: Uses the all-in-one plugin with `operation: "generateSchema"`.
   
   c. **LLM Translation Node**: Uses Coze's LLM to translate the schema.
   
   d. **Translation Application Node**: Uses the all-in-one plugin again with:
      - `operation: "applyTranslation"`
      - `json`: The original JSON
      - `translatedSchema`: The schema translated by the LLM
   
   e. **Output Node**: Returns the translated JSON and key mappings.

## Example Input/Output

### JSON to Schema Input:
```json
{
  "json": {
    "name": "John Doe",
    "age": 30,
    "contact": {
      "email": "john@example.com",
      "phone": "123-456-7890"
    }
  }
}
```

### JSON to Schema Output:
```json
{
  "schema": {
    "type": "object",
    "properties": {
      "name": { "type": "string" },
      "age": { "type": "number" },
      "contact": {
        "type": "object",
        "properties": {
          "email": { "type": "string" },
          "phone": { "type": "string" }
        }
      }
    }
  },
  "originalJson": {
    "name": "John Doe",
    "age": 30,
    "contact": {
      "email": "john@example.com",
      "phone": "123-456-7890"
    }
  }
}
```

### LLM Translation (example output):
```json
{
  "type": "object",
  "properties": {
    "姓名": { "type": "string" },
    "年龄": { "type": "number" },
    "联系方式": {
      "type": "object",
      "properties": {
        "电子邮件": { "type": "string" },
        "电话": { "type": "string" }
      }
    }
  }
}
```

### Apply Translation Input:
```json
{
  "originalJson": {
    "name": "John Doe",
    "age": 30,
    "contact": {
      "email": "john@example.com",
      "phone": "123-456-7890"
    }
  },
  "translatedSchema": {
    "type": "object",
    "properties": {
      "姓名": { "type": "string" },
      "年龄": { "type": "number" },
      "联系方式": {
        "type": "object",
        "properties": {
          "电子邮件": { "type": "string" },
          "电话": { "type": "string" }
        }
      }
    }
  },
  "preserveOriginalKeys": false
}
```

### Apply Translation Output:
```json
{
  "translatedJson": {
    "姓名": "John Doe",
    "年龄": 30,
    "联系方式": {
      "电子邮件": "john@example.com",
      "电话": "123-456-7890"
    }
  },
  "keyMap": {
    "name": "姓名",
    "age": "年龄",
    "contact": "联系方式",
    "email": "电子邮件",
    "phone": "电话"
  }
}
```

### All-in-One Plugin Input (Schema Generation):
```json
{
  "json": {
    "name": "John Doe",
    "age": 30,
    "contact": {
      "email": "john@example.com",
      "phone": "123-456-7890"
    }
  },
  "operation": "generateSchema"
}
```

### All-in-One Plugin Input (Apply Translation):
```json
{
  "json": {
    "name": "John Doe",
    "age": 30,
    "contact": {
      "email": "john@example.com",
      "phone": "123-456-7890"
    }
  },
  "operation": "applyTranslation",
  "translatedSchema": {
    "type": "object",
    "properties": {
      "姓名": { "type": "string" },
      "年龄": { "type": "number" },
      "联系方式": {
        "type": "object",
        "properties": {
          "电子邮件": { "type": "string" },
          "电话": { "type": "string" }
        }
      }
    }
  },
  "preserveOriginalKeys": false
}
```

## Notes

- The type declaration for `Args` from `@/runtime` is specific to Coze and will be resolved by the Coze platform.
- For large JSON structures, consider adding pagination or chunking to avoid hitting token limits.
- The key mapping is determined by position in the schema, so ensure the LLM preserves the structure. 