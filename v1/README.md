# JSON Translator

一个用于翻译JSON文件的Node.js工具，支持通过大语言模型（如OpenAI）实现高质量的键名翻译。

## 主要功能

1. **JSON Schema生成**：分析JSON结构，生成描述其结构的schema
2. **翻译中间体生成**：通过大语言模型API，生成JSON键名的翻译映射
3. **JSON翻译**：根据翻译中间体，将原始JSON转换为目标语言版本

## 安装

```bash
npm install json-translator
```

## 使用方法

### 基础用法

```typescript
import { translateJsonComplete } from 'json-translator';

// 示例JSON
const myJson = {
  user: {
    name: "John",
    age: 25,
    address: {
      city: "New York",
      country: "USA"
    }
  }
};

// 需要OpenAI API密钥
const apiKey = 'your-openai-api-key';

// 一步完成翻译
const translatedJson = await translateJsonComplete(myJson, apiKey);
console.log(translatedJson);
// 输出:
// {
//   "用户": {
//     "姓名": "John",
//     "年龄": 25,
//     "地址": {
//       "城市": "New York",
//       "国家": "USA"
//     }
//   }
// }
```

### 分步使用

你也可以分步骤使用各个功能：

```typescript
import { 
  generateSchema,
  initTranslator, 
  generateTranslationMap,
  translateJson
} from 'json-translator';

// 1. 生成JSON Schema
const schema = generateSchema(myJson);

// 2. 初始化翻译器
initTranslator('your-openai-api-key');

// 3. 生成翻译中间体
const translationMap = await generateTranslationMap(schema);

// 4. 根据中间体翻译JSON
const translatedJson = translateJson(myJson, translationMap);
```

## 配置选项

### 目标语言

默认目标语言为中文，你可以指定其他语言：

```typescript
// 翻译为日语
const translationMap = await generateTranslationMap(schema, '日语');
// 或者在一体化函数中
const translatedJson = await translateJsonComplete(myJson, apiKey, '日语');
```

## 高级用法

### 保存翻译中间体

你可以保存生成的翻译中间体以便重复使用，避免重复调用API：

```typescript
// 生成并保存翻译中间体
const translationMap = await generateTranslationMap(schema);
fs.writeFileSync('translation-map.json', JSON.stringify(translationMap, null, 2));

// 以后再使用
const savedMap = JSON.parse(fs.readFileSync('translation-map.json', 'utf8'));
const translatedJson = translateJson(myJson, savedMap);
```

## 限制

- 目前主要支持对象键名的翻译，不会翻译值
- 依赖OpenAI API，需要有效的API密钥
- 较大的JSON可能导致API调用次数增多，注意API使用量

## 贡献

欢迎贡献代码、报告问题或提出改进建议，可以通过以下方式：

1. 提交Issue
2. 创建Pull Request

## 许可

ISC 