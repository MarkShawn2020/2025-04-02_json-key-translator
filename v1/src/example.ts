/**
 * JSON翻译工具使用示例
 */
import { generateSchema, initTranslator, generateTranslationMap, translateJson, translateJsonComplete } from './index';

// 示例JSON数据
const exampleJson = {
  user: {
    name: "John Doe",
    age: 28,
    email: "john@example.com",
    address: {
      street: "123 Main St",
      city: "New York",
      country: "USA"
    },
    preferences: {
      theme: "dark",
      notifications: true
    },
    skills: ["JavaScript", "TypeScript", "React"]
  },
  settings: {
    language: "en",
    timezone: "UTC-5"
  }
};

/**
 * 完整翻译流程示例
 */
async function runExample() {
  try {
    // 1. 只生成Schema
    console.log("\n=== 生成JSON Schema ===");
    const schema = generateSchema(exampleJson);
    console.log(JSON.stringify(schema, null, 2));

    // 确保设置了OpenAI API密钥
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("请设置OPENAI_API_KEY环境变量");
      return;
    }

    // 2. 初始化翻译器
    console.log("\n=== 初始化翻译器 ===");
    initTranslator(apiKey);

    // 3. 生成翻译中间体
    console.log("\n=== 生成翻译中间体 ===");
    const translationMap = await generateTranslationMap(schema);
    console.log(JSON.stringify(translationMap, null, 2));

    // 4. 根据中间体翻译JSON
    console.log("\n=== 翻译JSON ===");
    const translatedJson = translateJson(exampleJson, translationMap);
    console.log(JSON.stringify(translatedJson, null, 2));

    // 5. 使用一体化函数翻译
    console.log("\n=== 使用一体化函数翻译 ===");
    const result = await translateJsonComplete(exampleJson, apiKey);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("示例运行失败:", error);
  }
}

// 运行示例
if (require.main === module) {
  console.log("运行JSON翻译示例...");
  runExample();
} 