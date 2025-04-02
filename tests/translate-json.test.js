/**
 * 测试 JSON 翻译功能
 */
// 导入 json-translator 库
const { translateJson } = require('@neuroa/json-translator');
// 导入测试数据
const { sampleJson, sampleTranslationMap } = require('./sample-data');

/**
 * 测试 translateJson 函数
 */
function testTranslateJson() {
  console.log('=== 测试 JSON 翻译 ===');
  
  try {
    // 步骤 1: 翻译 JSON
    console.log('翻译 JSON...');
    const translatedJson = translateJson(sampleJson, sampleTranslationMap);
    
    // 步骤 2: 输出结果
    console.log('翻译后的 JSON:');
    console.log(JSON.stringify(translatedJson, null, 2));
    
    // 步骤 3: 验证结果
    validateTranslation(translatedJson);
    
    console.log('测试成功: JSON 翻译正确！');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

/**
 * 验证翻译结果是否正确
 */
function validateTranslation(translatedJson) {
  // 检查顶级键是否被正确翻译
  if (!translatedJson['产品']) {
    throw new Error('顶级键 "product" 没有被正确翻译为 "产品"');
  }
  
  if (!translatedJson['制造商']) {
    throw new Error('顶级键 "manufacturer" 没有被正确翻译为 "制造商"');
  }
  
  if (!translatedJson['配送']) {
    throw new Error('顶级键 "shipping" 没有被正确翻译为 "配送"');
  }
  
  // 检查嵌套键是否被正确翻译
  if (!translatedJson['产品']['名称'] || translatedJson['产品']['名称'] !== 'Smart Watch Pro') {
    throw new Error('嵌套键 "product.name" 没有被正确翻译或值不匹配');
  }
  
  // 检查深度嵌套键是否被正确翻译
  if (!translatedJson['产品']['规格']['显示屏'] || 
      translatedJson['产品']['规格']['显示屏'] !== 'AMOLED 1.5 inch') {
    throw new Error('深度嵌套键 "product.specifications.display" 没有被正确翻译或值不匹配');
  }
  
  // 检查数组是否被正确处理
  if (!Array.isArray(translatedJson['产品']['颜色']) || 
      translatedJson['产品']['颜色'].length !== 3) {
    throw new Error('数组 "product.colors" 没有被正确处理');
  }
  
  // 检查数组对象是否被正确翻译
  if (!Array.isArray(translatedJson['配送']['方式']) || 
      translatedJson['配送']['方式'].length !== 2 ||
      !translatedJson['配送']['方式'][0]['类型'] ||
      translatedJson['配送']['方式'][0]['类型'] !== 'Standard') {
    throw new Error('数组对象 "shipping.methods" 没有被正确翻译');
  }
}

// 运行测试
testTranslateJson(); 