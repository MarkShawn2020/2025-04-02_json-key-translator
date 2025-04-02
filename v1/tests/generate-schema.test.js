/**
 * 测试 JSON schema 生成功能
 */
// 导入 json-translator 库
const { generateSchema } = require('@neuroa/json-translator');
// 导入测试数据
const { sampleJson } = require('./sample-data');

/**
 * 测试 generateSchema 函数
 */
function testGenerateSchema() {
  console.log('=== 测试 Schema 生成 ===');
  
  try {
    // 步骤 1: 生成 schema
    console.log('生成 schema...');
    const schema = generateSchema(sampleJson);
    
    // 步骤 2: 输出结果
    console.log('生成的 schema:');
    console.log(JSON.stringify(schema, null, 2));
    
    // 步骤 3: 验证结果
    validateSchema(schema);
    
    console.log('测试成功: Schema 生成正确！');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

/**
 * 验证生成的 schema 是否正确
 */
function validateSchema(schema) {
  // 检查顶级键
  const expectedTopKeys = ['product', 'manufacturer', 'shipping'];
  expectedTopKeys.forEach(key => {
    if (!schema[key]) {
      throw new Error(`缺少顶级键: ${key}`);
    }
  });
  
  // 检查产品规格
  if (typeof schema.product !== 'object') {
    throw new Error('product 应该是一个对象');
  }
  
  if (!schema.product.specifications || typeof schema.product.specifications !== 'object') {
    throw new Error('product.specifications 应该是一个对象');
  }
  
  // 检查数组处理是否正确
  if (!schema.product.colors || !schema.product.colors.type || schema.product.colors.type !== 'array') {
    throw new Error('product.colors 应该被识别为数组类型');
  }
  
  // 检查嵌套数组对象处理
  if (!schema.shipping.methods || !schema.shipping.methods.type || schema.shipping.methods.type !== 'array') {
    throw new Error('shipping.methods 应该被识别为数组类型');
  }
  
  if (!schema.shipping.methods.items || typeof schema.shipping.methods.items !== 'object') {
    throw new Error('shipping.methods.items 应该包含对象描述');
  }
}

// 运行测试
testGenerateSchema(); 