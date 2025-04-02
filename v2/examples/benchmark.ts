import { createJsonKeyTranslator, createSchemaTranslator } from '../src';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 生成一个大型、复杂、有重复键的测试JSON对象
function generateTestJson(depth: number = 3, breadth: number = 5, repeatedKeys: boolean = true): any {
  if (depth <= 0) return "leaf-value";
  
  const keys = ['name', 'type', 'description', 'id', 'value', 'key', 'data', 'info', 'settings', 'config'];
  const result: Record<string, any> = {};
  
  // 添加当前层级属性
  for (let i = 0; i < breadth; i++) {
    // 使用重复键模式或唯一键模式
    const keyIndex = repeatedKeys ? i % keys.length : i;
    const key = keyIndex < keys.length ? keys[keyIndex] : `unique_${i}`;
    
    // 每三个键创建一个嵌套对象
    if (i % 3 === 0) {
      result[key] = generateTestJson(depth - 1, breadth - 1, repeatedKeys);
    }
    // 每三个键创建一个数组
    else if (i % 3 === 1) {
      result[key] = Array(Math.max(1, breadth - 2))
        .fill(null)
        .map(() => generateTestJson(depth - 1, Math.max(1, breadth - 3), repeatedKeys));
    }
    // 其余创建简单值
    else {
      result[key] = `Value-${i}-${depth}`;
    }
  }
  
  return result;
}

// 记录API调用次数和耗时的翻译函数
function createCountingTranslator() {
  let callCount = 0;
  const startTime = Date.now();
  
  return {
    reset: () => {
      callCount = 0;
    },
    getCallCount: () => callCount,
    getElapsedTime: () => Date.now() - startTime,
    translator: async (text: string, from: string, to: string) => {
      callCount++;
      // 模拟翻译延迟
      await new Promise(resolve => setTimeout(resolve, 2));
      return `${text}_${to}`;
    }
  };
}

async function runBenchmark() {
  try {
    console.log('==========================================');
    console.log('性能基准测试: 常规翻译器 vs Schema翻译器');
    console.log('==========================================');
    
    // 生成测试数据
    console.log('生成测试数据...');
    const testJson = generateTestJson(4, 5, true);
    
    // 创建计数翻译器
    const counter1 = createCountingTranslator();
    const counter2 = createCountingTranslator();
    
    // 创建两种翻译器
    const regularTranslator = createJsonKeyTranslator({
      provider: 'custom',
      customTranslator: counter1.translator,
      useCache: true
    });
    
    const schemaTranslator = createSchemaTranslator({
      provider: 'custom',
      customTranslator: counter2.translator,
      useCache: true
    });
    
    // 测试常规翻译器
    console.log('\n测试 1: 常规遍历翻译器');
    console.time('regularTranslator');
    const regularResult = await regularTranslator.translateKeys(testJson);
    console.timeEnd('regularTranslator');
    
    // 测试Schema翻译器
    console.log('\n测试 2: Schema批量翻译器');
    console.time('schemaTranslator');
    const schemaResult = await schemaTranslator.translateJson(testJson);
    console.timeEnd('schemaTranslator');
    
    // 性能比较
    console.log('\n性能比较:');
    console.log(`- 常规翻译器 API调用次数: ${counter1.getCallCount()}`);
    console.log(`- Schema翻译器 API调用次数: ${counter2.getCallCount()}`);
    console.log(`- API调用减少: ${counter1.getCallCount() - counter2.getCallCount()} (${((1 - counter2.getCallCount() / counter1.getCallCount()) * 100).toFixed(2)}%)`);
    
    // 分析结果正确性
    const resultMatch = JSON.stringify(regularResult) === JSON.stringify(schemaResult);
    console.log(`\n结果一致性检查: ${resultMatch ? '通过 ✓' : '失败 ✗'}`);
    
    // 测试不同大小JSON的性能扩展性
    console.log('\n扩展性测试:');
    for (let size = 2; size <= 5; size++) {
      const scalingJson = generateTestJson(size, size + 1, true);
      
      // 重置计数器
      counter1.reset();
      counter2.reset();
      
      // 测试两种翻译器
      await regularTranslator.translateKeys(scalingJson);
      await schemaTranslator.translateJson(scalingJson);
      
      console.log(`- 大小 ${size} (大约 ${Object.keys(scalingJson).length * Math.pow(size, 2)} 个键):`);
      console.log(`  常规: ${counter1.getCallCount()} 次调用`);
      console.log(`  Schema: ${counter2.getCallCount()} 次调用`);
      console.log(`  优化比例: ${((1 - counter2.getCallCount() / counter1.getCallCount()) * 100).toFixed(2)}%`);
    }
    
    console.log('\n==========================================');
  } catch (error) {
    console.error('基准测试中发生错误:', error);
  }
}

// 运行基准测试
runBenchmark(); 