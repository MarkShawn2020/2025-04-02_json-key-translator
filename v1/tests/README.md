# JSON-Translator 测试与示例

本目录包含了 @neuroa/json-translator 库的测试和使用示例，帮助开发者理解如何在项目中集成和使用这个库。

## 目录结构

```
tests/
├── README.md                  # 本文件
├── sample-data.js             # 测试数据
├── generate-schema.test.js    # Schema 生成测试
├── translate-json.test.js     # JSON 翻译测试
├── complete-workflow.test.js  # 完整工作流程测试
├── run-all-tests.js           # 运行所有测试的脚本
└── usage-example.js           # 使用示例
```

## 运行测试

### 前提条件

1. 确保已安装依赖：

```bash
npm install @neuroa/json-translator
```

2. 对于涉及 OpenAI API 的测试，需要设置环境变量：

```bash
export OPENAI_API_KEY=your_api_key_here
```

### 运行所有测试

```bash
node tests/run-all-tests.js
```

### 单独运行测试

```bash
# Schema 生成测试（不需要 API 密钥）
node tests/generate-schema.test.js

# JSON 翻译测试（不需要 API 密钥）
node tests/translate-json.test.js

# 完整工作流程测试（需要 API 密钥）
node tests/complete-workflow.test.js
```

## 使用示例

`usage-example.js` 文件展示了几种常见的使用场景：

1. 最简单的用法 - 一步完成翻译
2. 分步操作 - 重用翻译中间体
3. 国际化场景 - 将 JSON 翻译成多种语言

运行示例：

```bash
# 需要设置 OPENAI_API_KEY 环境变量
node tests/usage-example.js
```

也可以单独运行特定示例：

```javascript
const examples = require('./tests/usage-example');

// 运行简单翻译示例
examples.simpleTranslation();

// 运行高级翻译示例
examples.advancedTranslation();

// 运行国际化翻译示例
examples.i18nTranslation();
```

## 注意事项

1. 大部分涉及翻译的测试需要 OpenAI API 密钥
2. 部分测试会生成临时文件，如翻译中间体和翻译结果

## 示例输出

成功执行测试后，你将看到类似以下的输出：

```
=== 测试 Schema 生成 ===
生成 schema...
生成的 schema:
{
  "product": {
    "name": "string",
    "price": "number",
    ...
  },
  ...
}
测试成功: Schema 生成正确！
```

翻译示例的输出：

```
=== 测试 JSON 翻译 ===
翻译 JSON...
翻译后的 JSON:
{
  "产品": {
    "名称": "Smart Watch Pro",
    "价格": 199.99,
    ...
  },
  ...
}
测试成功: JSON 翻译正确！
``` 