import { createSchemaTranslator } from '../src';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 示例JSON对象，包含重复键以展示优化效果
const sampleJson = {
  user: {
    name: 'John Smith',
    age: 30,
    address: {
      city: 'New York',
      country: 'USA',
      zipCode: '10001'
    },
    // 注意这里的type键在多处重复出现
    preferences: {
      type: 'userPreferences',
      settings: {
        theme: 'dark',
        notifications: {
          type: 'email',
          frequency: 'daily'
        }
      }
    }
  },
  products: [
    { 
      id: 1, 
      name: 'Laptop', 
      type: 'electronics',
      details: {
        brand: 'Apple',
        model: 'MacBook Pro',
        specifications: {
          type: 'technical',
          cpu: 'M1 Pro',
          ram: '16GB'
        }
      }
    },
    { 
      id: 2, 
      name: 'Smartphone', 
      type: 'electronics',
      details: {
        brand: 'Samsung',
        model: 'Galaxy S21',
        specifications: {
          type: 'technical',
          cpu: 'Snapdragon 888',
          ram: '8GB'
        }
      }
    }
  ],
  settings: {
    type: 'appSettings',
    language: 'english',
    region: 'US'
  }
};

// 自定义调试用的翻译函数，记录翻译调用次数
let apiCallCount = 0;
const customTranslator = async (text: string, from: string, to: string) => {
  apiCallCount++;
  console.log(`API调用 #${apiCallCount}: 翻译 "${text}" (${from} -> ${to})`);
  
  // 简单示例：附加目标语言作为后缀
  return `${text}_${to}`;
};

async function main() {
  try {
    console.log('==========================================');
    console.log('基于Schema的批量翻译器示例');
    console.log('==========================================');
    
    // 创建Schema翻译器实例
    const schemaTranslator = createSchemaTranslator({
      sourceLanguage: 'en',
      targetLanguage: 'zh-CN',
      provider: 'custom',
      customTranslator: customTranslator,
      useCache: true
    });
    
    console.log('\n原始JSON对象:');
    console.log(JSON.stringify(sampleJson, null, 2).substring(0, 500) + '...');
    
    console.log('\n开始翻译...');
    const translatedJson = await schemaTranslator.translateJson(sampleJson);
    
    console.log('\n翻译后的JSON对象:');
    console.log(JSON.stringify(translatedJson, null, 2).substring(0, 500) + '...');
    
    // 分析优化效果
    console.log('\n性能分析:');
    console.log(`- 总API调用次数: ${apiCallCount}`);
    
    // 计算原始JSON中有多少个键
    let totalKeys = 0;
    const countKeys = (obj: any): number => {
      if (!obj || typeof obj !== 'object') return 0;
      
      let count = 0;
      if (Array.isArray(obj)) {
        obj.forEach(item => {
          count += countKeys(item);
        });
      } else {
        count = Object.keys(obj).length;
        Object.values(obj).forEach(value => {
          if (value && typeof value === 'object') {
            count += countKeys(value);
          }
        });
      }
      return count;
    };
    
    totalKeys = countKeys(sampleJson);
    console.log(`- JSON中总键数: ${totalKeys}`);
    console.log(`- 重复键数: ${totalKeys - apiCallCount}`);
    console.log(`- 优化比例: ${((totalKeys - apiCallCount) / totalKeys * 100).toFixed(2)}%`);
    
    // 再次翻译同一对象以测试缓存效果
    console.log('\n使用缓存再次翻译同一对象...');
    apiCallCount = 0; // 重置计数器
    await schemaTranslator.translateJson(sampleJson);
    console.log(`- 第二次翻译API调用次数: ${apiCallCount} (应为0，因为所有键都在缓存中)`);
    
    console.log('\n==========================================');
  } catch (error) {
    console.error('翻译过程中发生错误:', error);
  }
}

// 运行示例
main(); 