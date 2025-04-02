# JSON 大师 - Coze 插件

JSON 大师是一套专为 Coze 平台设计的 JSON 处理工具集，提供高效便捷的 JSON 转换、翻译和展示功能。通过这些插件，您可以轻松实现 JSON 数据的各种处理需求，无需复杂的编程知识。

## 功能概览

JSON 大师包含三个强大的工具:

1. **json2schema** - 将 JSON 对象转换为结构化的 schema，便于理解和处理复杂 JSON 结构
2. **translate_json_keys** - 翻译 JSON 对象的键名，支持多语言场景，保持数据结构不变
3. **json2md** - 将 JSON 数据转换为美观的 Markdown 表格，提升数据可读性

## 插件详情

### json2schema

将复杂的 JSON 对象转换为清晰的结构描述。

**输入:**
- `json`: JSON 字符串或对象

**输出:**
- `schema`: 生成的 JSON schema 字符串

**示例:**

输入:
```json
{
  "json": "{\"name\":\"John\",\"age\":30,\"contact\":{\"email\":\"john@example.com\"}}"
}
```

输出:
```json
{
  "schema": "{\"type\":\"object\",\"properties\":{\"name\":{\"type\":\"string\"},\"age\":{\"type\":\"number\"},\"contact\":{\"type\":\"object\",\"properties\":{\"email\":{\"type\":\"string\"}}}}}"
}
```

### translate_json_keys

将 JSON 对象的键名翻译为目标语言，保持原始数据结构和值不变。

**输入:**
- `originalJson`: 原始 JSON 字符串或对象
- `translatedSchema`: 已翻译的 schema 字符串或对象
- `preserveOriginalKeys`: 是否保留原始键名 (可选，默认 false)

**输出:**
- `translatedJson`: 键名已翻译的 JSON 对象
- `keyMap`: 原始键名到翻译键名的映射

**使用流程:**
1. 使用 `json2schema` 生成原始 JSON 的 schema
2. 通过 LLM 或其他方式翻译 schema 中的键名
3. 使用 `translate_json_keys` 将翻译后的 schema 应用到原始 JSON

**示例:**

输入:
```json
{
  "originalJson": "{\"name\":\"John\",\"age\":30,\"contact\":{\"email\":\"john@example.com\"}}",
  "translatedSchema": "{\"type\":\"object\",\"properties\":{\"姓名\":{\"type\":\"string\"},\"年龄\":{\"type\":\"number\"},\"联系方式\":{\"type\":\"object\",\"properties\":{\"邮箱\":{\"type\":\"string\"}}}}}"
}
```

输出:
```json
{
  "translatedJson": {
    "姓名": "John",
    "年龄": 30,
    "联系方式": {
      "邮箱": "john@example.com"
    }
  },
  "keyMap": {
    "name": "姓名",
    "age": "年龄",
    "contact": "联系方式",
    "email": "邮箱"
  }
}
```

### json2md

将 JSON 数据转换为格式化的 Markdown 表格，提升可读性和展示效果。

**输入:**
- `json`: JSON 字符串或对象
- `options`: 转换选项 (可选)
  - `nestingLevel`: 嵌套级别 (默认: 1)
  - `includeHeaders`: 是否包含表头 (默认: true)

**输出:**
- `markdown`: 生成的 Markdown 文本

**示例:**

输入:
```json
{
  "json": "[{\"name\":\"John\",\"age\":30},{\"name\":\"Jane\",\"age\":25}]"
}
```

输出:
```json
{
  "markdown": "| name | age |\n|------|-----|\n| John | 30  |\n| Jane | 25  |"
}
```

渲染效果:

| name | age |
|------|-----|
| John | 30  |
| Jane | 25  |

## 在 Coze 中使用

1. 在 Coze 平台添加这些插件
2. 创建新的工作流，通过菜单添加插件
3. 为插件提供所需的输入参数
4. 链接多个插件以实现复杂的 JSON 处理流程

## 最佳实践

- **JSON 键名翻译流程**:
  1. 使用 `json2schema` 生成 schema
  2. 让 AI 翻译 schema 中的键名
  3. 使用 `translate_json_keys` 应用翻译

- **改善数据展示**:
  1. 获取 JSON 数据
  2. 使用 `json2md` 将其转换为 Markdown 表格
  3. 在聊天界面中显示格式化结果

- **处理大型 JSON**:
  对于大型 JSON 数据，考虑先使用结构化操作处理，再进行转换或翻译

## 注意事项

- 所有插件均为自包含设计，无需额外依赖
- 插件支持 JSON 字符串和对象两种输入格式
- 大型 JSON 处理可能需要适当调整策略 