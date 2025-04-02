/**
 * 测试完整翻译流程
 * 注意：此测试需要提供有效的 OpenAI API 密钥
 */
// 导入 json-translator 库
const { 
  generateSchema, 
  initTranslator, 
  generateTranslationMap, 
  translateJson, 
  translateJsonComplete 
} = require('@neuroa/json-translator');

// 导入测试数据
const { sampleJson } = require('./sample-data');
const fs = require('fs');
const path = require('path');

/**
 * 测试翻译中间体生成
 * 需要有效的 OpenAI API 密钥
 */
async function testGenerateTranslationMap() {
  console.log('=== 测试翻译中间体生成 ===');
  
  try {
    // 检查是否有 API 密钥
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('警告: 未设置 OPENAI_API_KEY 环境变量，跳过此测试');
      return false;
    }
    
    // 步骤 1: 生成 schema
    console.log('生成 JSON schema...');
    const schema = generateSchema(sampleJson);
    
    // 步骤 2: 初始化翻译器
    console.log('初始化翻译器...');
    initTranslator(apiKey);
    
    // 步骤 3: 生成翻译中间体
    console.log('生成翻译中间体...');
    const translationMap = await generateTranslationMap(schema);
    
    // 步骤 4: 输出结果
    console.log('生成的翻译中间体:');
    console.log(JSON.stringify(translationMap, null, 2));
    
    // 保存翻译中间体以供后续使用
    const outputPath = path.join(__dirname, 'generated-translation-map.json');
    fs.writeFileSync(outputPath, JSON.stringify(translationMap, null, 2));
    console.log(`翻译中间体已保存至: ${outputPath}`);
    
    console.log('测试成功: 翻译中间体生成正确！');
    return translationMap;
  } catch (error) {
    console.error('测试失败:', error);
    return false;
  }
}

/**
 * 测试完整翻译流程
 */
async function testCompleteWorkflow() {
  console.log('=== 测试完整翻译流程 ===');
  
  try {
    // 检查是否有 API 密钥
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('警告: 未设置 OPENAI_API_KEY 环境变量，跳过此测试');
      return;
    }
    
    // 使用一体化函数进行翻译
    console.log('使用一体化函数翻译 JSON...');
    const translatedJson = await translateJsonComplete(sampleJson, apiKey);
    
    // 输出结果
    console.log('翻译后的 JSON:');
    console.log(JSON.stringify(translatedJson, null, 2));
    
    // 保存翻译结果
    const outputPath = path.join(__dirname, 'complete-workflow-result.json');
    fs.writeFileSync(outputPath, JSON.stringify(translatedJson, null, 2));
    console.log(`翻译结果已保存至: ${outputPath}`);
    
    console.log('测试成功: 完整翻译流程运行正确！');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

/**
 * 运行所有测试
 */
async function runTests() {
  console.log('开始运行测试...');
  
  // 首先测试翻译中间体生成
  const translationMap = await testGenerateTranslationMap();
  
  // 如果翻译中间体生成成功，使用它进行翻译
  if (translationMap) {
    console.log('\n使用生成的翻译中间体进行翻译...');
    const translatedJson = translateJson(sampleJson, translationMap);
    console.log('翻译结果:');
    console.log(JSON.stringify(translatedJson, null, 2));
  }
  
  // 测试完整流程
  console.log('\n');
  await testCompleteWorkflow();
  
  console.log('\n所有测试完成');
}

// 运行测试
if (require.main === module) {
  runTests();
} 