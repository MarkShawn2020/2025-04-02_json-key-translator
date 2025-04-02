# JSON Key Translator

一个高性能的用于翻译 JSON 对象键的 Node.js 库，支持多种翻译提供商。

## 特点

- 高性能批量处理
- Schema优化模式，显著减少API调用
- 多级嵌套 JSON 对象键翻译
- LRU 缓存支持
- 多种翻译服务提供商支持（Google、自定义等）
- 完全类型支持（TypeScript）
- 可扩展的架构设计

## 安装

```bash
npm install json-key-translator
# 或
yarn add json-key-translator
```

## 使用方法

### 基本使用

```typescript
import { createJsonKeyTranslator } from 'json-key-translator';

// 创建翻译器实例
const translator = createJsonKeyTranslator({
  sourceLanguage: 'en',
  targetLanguage: 'zh-CN',
  provider: 'google',
  apiKey: 'YOUR_GOOGLE_API_KEY'
});

// 翻译 JSON 对象的键
const json = {
  user: {
    name: 'John',
    address: {
      city: 'New York',
      country: 'USA'
    }
  }
};

// 异步翻译
translator.translateKeys(json).then(translated => {
  console.log(JSON.stringify(translated, null, 2));
});
```

### 高性能Schema模式

库提供了一个基于Schema的翻译方式，可以大幅减少API调用次数，尤其适合具有重复键的大型JSON：

```typescript
import { createSchemaTranslator } from 'json-key-translator';

// 创建Schema翻译器实例
const schemaTranslator = createSchemaTranslator({
  sourceLanguage: 'en',
  targetLanguage: 'zh-CN',
  provider: 'google',
  apiKey: 'YOUR_GOOGLE_API_KEY'
});

// Schema模式翻译
const result = await schemaTranslator.translateJson(yourJsonObject);
```

Schema翻译器的工作原理：
1. 提取JSON中的所有唯一键（而不是逐个翻译每个键）
2. 批量翻译这些唯一键
3. 使用翻译映射重建JSON结构

这种方式可以显著减少API调用次数（通常可减少50-80%），特别是对于大型、有重复键的JSON。

### 使用自定义翻译函数

```typescript
import { createJsonKeyTranslator, createSchemaTranslator } from 'json-key-translator';

const translator = createSchemaTranslator({
  provider: 'custom',
  customTranslator: async (text, from, to) => {
    // 接入任何翻译服务或实现自己的翻译逻辑
    // 示例: 使用第三方API
    const response = await fetch('https://your-translation-api.com', {
      method: 'POST',
      body: JSON.stringify({ text, from, to })
    });
    const data = await response.json();
    return data.translatedText;
  }
});

// 使用自定义翻译器翻译JSON键
const result = await translator.translateJson(yourJsonObject);
```

## 配置选项

```typescript
interface TranslationOptions {
  // 源语言 (默认: 'en')
  sourceLanguage?: string;
  
  // 目标语言 (默认: 'zh-CN')
  targetLanguage?: string;
  
  // 翻译服务提供商 (默认: 'google')
  provider?: 'google' | 'openai' | 'azure' | 'custom';
  
  // 自定义翻译函数
  customTranslator?: (text: string, from: string, to: string) => Promise<string>;
  
  // API密钥（如果使用第三方服务）
  apiKey?: string;
  
  // 缓存已翻译的键 (默认: true)
  useCache?: boolean;
  
  // 最大缓存大小（条目数）(默认: 1000)
  maxCacheSize?: number;
  
  // 批处理大小（用于批量翻译）(默认: 10)
  batchSize?: number;
  
  // 自定义日志函数
  logger?: (message: string, level: 'info' | 'error' | 'debug') => void;
}
```

## 性能优化技巧

1. **使用Schema翻译器**: 对于大型或有大量重复键的JSON，推荐使用 `createSchemaTranslator`
2. **启用缓存**: 默认情况下缓存是启用的，对于重复的键只会翻译一次
3. **调整批处理大小**: 根据您的翻译服务限制和性能需求调整 `batchSize`
4. **自定义翻译函数**: 如果需要更高的性能，可以实现带有并发控制的自定义翻译函数

## 性能比较

对比一个具有重复键的深度嵌套JSON对象的翻译：

| 方法 | API调用次数 | 相对性能 |
|------|------------|---------|
| 标准键翻译 | 100% | 基准线 |
| Schema批量翻译 | 约25-40% | 减少约60-75%的API调用 |

## 贡献

欢迎贡献！请随时提交问题或拉取请求。

## 许可证

MIT 