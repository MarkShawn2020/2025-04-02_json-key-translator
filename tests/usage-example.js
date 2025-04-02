/**
 * JSON-Translator 使用示例
 * 
 * 此文件展示了如何在实际项目中使用 json-translator 库
 */

// 导入 json-translator 库的不同组件
const {
  // 核心功能
  generateSchema,        // 生成 JSON Schema
  translateJson,         // 根据翻译中间体翻译 JSON
  
  // 翻译相关
  initTranslator,        // 初始化翻译器
  generateTranslationMap,// 生成翻译中间体
  
  // 完整工作流
  translateJsonComplete  // 一步完成翻译
} = require('@neuroa/json-translator');

// 导入文件系统模块用于本地文件操作
const fs = require('fs');
const path = require('path');

/**
 * 示例 1: 最简单的用法 - 一步完成翻译
 */
async function simpleTranslation() {
  // 示例 JSON 数据
  const jsonData = {
    user: {
      firstName: "John",
      lastName: "Doe",
      age: 28,
      email: "john@example.com",
      settings: {
        notifications: true,
        theme: "dark"
      }
    }
  };
  
  try {
    // 确保有 API 密钥
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('请设置 OPENAI_API_KEY 环境变量');
      return;
    }
    
    // 一步完成翻译
    console.log('一步完成翻译中...');
    const translatedJson = await translateJsonComplete(jsonData, apiKey);
    
    console.log('翻译结果:');
    console.log(JSON.stringify(translatedJson, null, 2));
  } catch (error) {
    console.error('翻译失败:', error);
  }
}

/**
 * 示例 2: 分步操作 - 重用翻译中间体
 */
async function advancedTranslation() {
  // 示例 JSON 数据集
  const jsonDataSet = [
    {
      product: {
        name: "Laptop Pro",
        price: 1499.99,
        specs: {
          processor: "i9",
          memory: "32GB"
        }
      }
    },
    {
      product: {
        name: "Desktop Pro",
        price: 1999.99,
        specs: {
          processor: "i9",
          memory: "64GB"
        }
      }
    }
  ];
  
  try {
    // 确保有 API 密钥
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('请设置 OPENAI_API_KEY 环境变量');
      return;
    }
    
    // 步骤 1: 为第一个 JSON 生成 schema
    console.log('为第一个 JSON 生成 schema...');
    const schema = generateSchema(jsonDataSet[0]);
    
    // 步骤 2: 初始化翻译器
    console.log('初始化翻译器...');
    initTranslator(apiKey);
    
    // 步骤 3: 生成翻译中间体
    console.log('生成翻译中间体...');
    const translationMap = await generateTranslationMap(schema);
    
    // 可选: 保存翻译中间体以便将来使用
    const mapPath = path.join(__dirname, 'product-translation-map.json');
    fs.writeFileSync(mapPath, JSON.stringify(translationMap, null, 2));
    console.log(`翻译中间体已保存至: ${mapPath}`);
    
    // 步骤 4: 使用相同的翻译中间体批量翻译多个 JSON
    console.log('使用相同的翻译中间体翻译多个 JSON...');
    const results = jsonDataSet.map((json, index) => {
      const translated = translateJson(json, translationMap);
      return {
        original: json,
        translated
      };
    });
    
    console.log('批量翻译结果:');
    results.forEach((result, index) => {
      console.log(`\n[JSON ${index + 1}]`);
      console.log(JSON.stringify(result.translated, null, 2));
    });
  } catch (error) {
    console.error('翻译失败:', error);
  }
}

/**
 * 示例 3: 国际化场景 - 将 JSON 翻译成多种语言
 */
async function i18nTranslation() {
  // 示例语言环境配置
  const languages = ['中文', '日语', '西班牙语'];
  
  // 示例 JSON 数据
  const jsonData = {
    app: {
      title: "My Application",
      welcome: "Welcome to the app",
      buttons: {
        save: "Save",
        cancel: "Cancel",
        help: "Help"
      }
    }
  };
  
  try {
    // 确保有 API 密钥
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('请设置 OPENAI_API_KEY 环境变量');
      return;
    }
    
    // 生成 schema
    console.log('生成 schema...');
    const schema = generateSchema(jsonData);
    
    // 初始化翻译器
    console.log('初始化翻译器...');
    initTranslator(apiKey);
    
    // 为每种语言生成翻译
    console.log('为多种语言生成翻译...');
    const i18nResults = {};
    
    for (const language of languages) {
      console.log(`翻译为 ${language}...`);
      const translationMap = await generateTranslationMap(schema, language);
      const translated = translateJson(jsonData, translationMap);
      
      i18nResults[language] = translated;
      
      // 可选: 保存每种语言的翻译结果
      const outputPath = path.join(__dirname, `i18n-${language}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(translated, null, 2));
      console.log(`${language} 翻译已保存至: ${outputPath}`);
    }
    
    console.log('多语言翻译完成!');
  } catch (error) {
    console.error('翻译失败:', error);
  }
}

/**
 * 运行示例
 */
async function runExamples() {
  console.log('===== JSON 翻译工具使用示例 =====\n');
  
  console.log('示例 1: 最简单的用法 - 一步完成翻译');
  console.log('--------------------------------------');
  await simpleTranslation();
  
  console.log('\n\n示例 2: 分步操作 - 重用翻译中间体');
  console.log('--------------------------------------');
  await advancedTranslation();
  
  console.log('\n\n示例 3: 国际化场景 - 将 JSON 翻译成多种语言');
  console.log('--------------------------------------');
  await i18nTranslation();
  
  console.log('\n所有示例执行完毕!');
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
  runExamples();
} else {
  // 导出示例函数以便单独使用
  module.exports = {
    simpleTranslation,
    advancedTranslation,
    i18nTranslation,
    runExamples
  };
} 