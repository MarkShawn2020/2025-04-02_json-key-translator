/**
 * 翻译相关功能
 */
import { OpenAI } from 'openai';
import { z } from 'zod';

// 翻译中间体类型定义
export type TranslationMap = Record<string, {
  original: string;
  translated: string;
  children?: TranslationMap;
}>;

// OpenAI客户端
let openaiClient: OpenAI | null = null;

/**
 * 初始化OpenAI客户端
 * @param apiKey - OpenAI API密钥
 */
export function initTranslator(apiKey: string): void {
  openaiClient = new OpenAI({
    apiKey,
  });
  console.log('Translator initialized with OpenAI client');
}

/**
 * 检查OpenAI客户端是否已初始化
 */
function ensureOpenAIClient(): void {
  if (!openaiClient) {
    throw new Error('OpenAI client not initialized. Call initTranslator first.');
  }
}

/**
 * 将英文JSON schema转换为翻译中间体
 * @param schema - 英文JSON schema
 * @param targetLanguage - 目标语言，默认为中文
 * @returns 翻译中间体
 */
export async function generateTranslationMap(
  schema: Record<string, any>,
  targetLanguage: string = '中文'
): Promise<TranslationMap> {
  ensureOpenAIClient();
  
  const result: TranslationMap = {};
  
  // 处理所有顶级键
  const keys = Object.keys(schema);
  
  // 分批处理，避免请求过大
  const batchSize = 10;
  for (let i = 0; i < keys.length; i += batchSize) {
    const batch = keys.slice(i, i + batchSize);
    const batchEntries = batch.map(key => ({
      key,
      value: schema[key]
    }));
    
    // 准备提示内容
    const prompt = createTranslationPrompt(batchEntries, targetLanguage);
    
    try {
      // 调用API获取翻译 - 我们已确保openaiClient不为null
      const client = openaiClient as OpenAI;
      const response = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No response from API');
      
      try {
        // 解析响应
        const parsedResponse = JSON.parse(content);
        
        // 验证响应格式
        for (const item of parsedResponse) {
          const parsed = z.object({
            key: z.string(),
            translation: z.string(),
          }).safeParse(item);
          
          if (parsed.success) {
            const { key, translation } = parsed.data;
            
            result[key] = {
              original: key,
              translated: translation,
            };
            
            // 如果值是对象，递归处理
            if (typeof schema[key] === 'object' && schema[key] !== null && !Array.isArray(schema[key])) {
              result[key].children = await generateTranslationMap(schema[key], targetLanguage);
            }
            // 处理数组中的对象
            else if (typeof schema[key] === 'object' && schema[key]?.type === 'array' && 
                     schema[key]?.items && typeof schema[key].items === 'object') {
              result[key].children = await generateTranslationMap(schema[key].items, targetLanguage);
            }
          }
        }
      } catch (err) {
        console.error('Failed to parse API response:', err);
        console.log('API response:', content);
        throw new Error('Failed to parse API response');
      }
    } catch (err) {
      console.error('Translation API error:', err);
      throw err;
    }
    
    // 添加延迟避免频率限制
    if (i + batchSize < keys.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return result;
}

/**
 * 创建翻译提示
 */
function createTranslationPrompt(entries: { key: string; value: any }[], targetLanguage: string): string {
  return `
请将以下JSON键名从英文翻译为${targetLanguage}。只需翻译键名，不要翻译值或类型。
返回JSON格式的数组，每个对象包含原键名和翻译。

输入:
${JSON.stringify(entries, null, 2)}

请用以下格式返回:
[
  {
    "key": "原英文键名",
    "translation": "翻译后的${targetLanguage}键名"
  },
  ...
]
`;
}

/**
 * 根据原始JSON和翻译中间体生成翻译后的JSON
 * @param json - 原始JSON
 * @param translationMap - 翻译中间体
 * @returns 翻译后的JSON
 */
export function translateJson(
  json: Record<string, any>,
  translationMap: TranslationMap
): Record<string, any> {
  const result: Record<string, any> = {};
  
  // 遍历原始JSON的所有键
  for (const [key, value] of Object.entries(json)) {
    const translation = translationMap[key];
    
    if (!translation) {
      // 如果找不到翻译，保留原始键
      result[key] = value;
      console.warn(`No translation found for key: ${key}`);
      continue;
    }
    
    const translatedKey = translation.translated;
    
    if (Array.isArray(value)) {
      // 处理数组
      result[translatedKey] = value.map(item => {
        if (typeof item === 'object' && item !== null && translation.children) {
          return translateJson(item, translation.children);
        }
        return item;
      });
    } else if (typeof value === 'object' && value !== null && translation.children) {
      // 递归处理嵌套对象
      result[translatedKey] = translateJson(value, translation.children);
    } else {
      // 处理基本类型
      result[translatedKey] = value;
    }
  }
  
  return result;
} 