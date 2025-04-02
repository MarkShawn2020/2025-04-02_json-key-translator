import { createJsonKeyTranslator } from '../src';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 创建翻译器实例，使用Google翻译（需要提供API密钥）
const translator = createJsonKeyTranslator({
  sourceLanguage: 'en',
  targetLanguage: 'zh-CN',
  provider: 'google',
  apiKey: process.env.GOOGLE_API_KEY,
  useCache: true,
  maxCacheSize: 2000,
  batchSize: 5
});

// 待翻译的JSON对象
const sampleJson = {
  user: {
    name: 'John Smith',
    age: 30,
    address: {
      city: 'New York',
      country: 'USA',
      zipCode: '10001'
    },
    phoneNumbers: [
      { type: 'home', number: '212-555-1234' },
      { type: 'work', number: '646-555-5678' }
    ]
  },
  settings: {
    enableNotifications: true,
    displayMode: 'dark',
    language: 'english'
  },
  lastLogin: '2023-01-15T12:30:45Z'
};

// 使用自定义翻译函数的示例
const customTranslator = createJsonKeyTranslator({
  provider: 'custom',
  customTranslator: async (text, from, to) => {
    // 这里可以接入任何翻译API或逻辑
    console.log(`翻译: ${text} (${from} -> ${to})`);
    
    // 简单示例：在键后面添加语言代码
    return `${text}_${to}`;
  }
});

// 执行翻译并输出结果
async function main() {
  try {
    // 如果有Google API密钥则使用Google翻译
    if (process.env.GOOGLE_API_KEY) {
      console.log('使用Google翻译服务...');
      const translated = await translator.translateKeys(sampleJson);
      console.log(JSON.stringify(translated, null, 2));
    } else {
      // 否则使用自定义翻译函数
      console.log('使用自定义翻译函数...');
      const translated = await customTranslator.translateKeys(sampleJson);
      console.log(JSON.stringify(translated, null, 2));
    }
  } catch (error) {
    console.error('翻译过程中发生错误:', error);
  }
}

// 运行示例
main(); 