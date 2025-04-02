/// <reference types="node" />
import { translateKeys, transformJson, createDeepSeekTranslator } from './index';

// Example 1: Basic usage
async function basicExample() {
  console.log('Example 1: Basic JSON key translation');
  
  // English JSON
  const englishJson = {
    user: {
      firstName: 'John',
      lastName: 'Doe',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        zipCode: '12345'
      },
      contacts: [
        { type: 'email', value: 'john@example.com' },
        { type: 'phone', value: '555-1234' }
      ]
    },
    settings: {
      theme: 'dark',
      notifications: {
        email: true,
        push: false
      }
    }
  };
  
  try {
    // This will use the default translation function (placeholder)
    // In a real scenario, you would provide a proper translation function
    const result = await translateKeys(englishJson, {
      sourceLanguage: 'en',
      targetLanguage: 'zh'
    });
    
    console.log('Key mapping:');
    console.log(JSON.stringify(result.keyMap, null, 2));
    
    console.log('\nTranslated JSON:');
    console.log(JSON.stringify(result.translatedJson, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 2: Using DeepSeek (requires API key)
async function deepSeekExample() {
  console.log('\nExample 2: Translation with DeepSeek AI');
  
  // Get API key from environment variable
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    console.log('Skipping DeepSeek example - no API key provided');
    console.log('Set the DEEPSEEK_API_KEY environment variable to run this example');
    return;
  }
  
  const deepSeekTranslator = createDeepSeekTranslator({
    apiKey,
    temperature: 0.1
  });
  
  const simpleJson = {
    product: {
      name: 'Smart Watch',
      description: 'A modern smart watch with health tracking',
      features: ['heart rate', 'sleep tracking', 'notifications'],
      pricing: {
        regular: 199.99,
        discount: 149.99
      }
    }
  };
  
  try {
    const result = await translateKeys(simpleJson, {
      sourceLanguage: 'en',
      targetLanguage: 'zh',
      translationFn: deepSeekTranslator
    });
    
    console.log('Key mapping:');
    console.log(JSON.stringify(result.keyMap, null, 2));
    
    console.log('\nTranslated JSON:');
    console.log(JSON.stringify(result.translatedJson, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 3: Transforming JSON with existing mapping
function transformExample() {
  console.log('\nExample 3: Transform JSON with existing key mapping');
  
  // Existing key mapping (could be loaded from a file in a real application)
  const keyMap = {
    user: '用户',
    firstName: '名',
    lastName: '姓',
    email: '邮箱',
    phone: '电话',
    address: '地址'
  };

  console.log(keyMap);
  
  const userData = {
    user: {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      phone: '555-5678',
      address: '456 Oak St'
    }
  };
  
  const transformedJson = transformJson(userData, keyMap);
  
  console.log('Original JSON:');
  console.log(JSON.stringify(userData, null, 2));
  
  console.log('\nTransformed JSON with mapped keys:');
  console.log(JSON.stringify(transformedJson, null, 2));
}

// Run examples
async function runExamples() {
  await basicExample();
  await deepSeekExample();
  transformExample();
}

// Execute if file is run directly
if (typeof require !== 'undefined' && require.main === module) {
  runExamples().catch(console.error);
} 