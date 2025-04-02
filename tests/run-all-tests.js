/**
 * 运行所有测试
 */
console.log('===== JSON 翻译工具测试 =====');

// 测试执行顺序
const tests = [
  { name: 'Schema 生成测试', path: './generate-schema.test.js' },
  { name: 'JSON 翻译测试', path: './translate-json.test.js' },
  { name: '完整工作流程测试 (需要 OpenAI API 密钥)', path: './complete-workflow.test.js' }
];

// 运行所有测试
async function runAllTests() {
  for (const test of tests) {
    console.log(`\n\n执行: ${test.name}`);
    console.log('---------------------------------------');
    
    try {
      // 动态导入每个测试模块
      if (test.path.includes('complete-workflow')) {
        // 异步测试
        const testModule = require(test.path);
        if (typeof testModule.runTests === 'function') {
          await testModule.runTests();
        }
      } else {
        // 同步测试
        require(test.path);
      }
    } catch (error) {
      console.error(`${test.name} 执行失败:`, error);
    }
    
    console.log('---------------------------------------');
  }
  
  console.log('\n所有测试执行完毕!');
}

// 运行测试
runAllTests(); 