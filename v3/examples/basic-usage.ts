import { translateJsonKeys } from '../src';

// Mock LLM translation function for demonstration purposes
async function mockLLMTranslation(schema: any): Promise<any> {
  // In a real scenario, this would call an LLM API
  // For demo purposes, we'll perform a hardcoded translation
  console.log('Schema sent for translation:', JSON.stringify(schema, null, 2));
  
  // Simulate a translation by transforming the properties
  if (schema.type === 'object' && schema.properties) {
    const translatedProperties: Record<string, any> = {};
    
    // Hardcoded translations for demo
    const translations: Record<string, string> = {
      'name': '姓名',
      'age': '年龄',
      'contact': '联系方式',
      'email': '电子邮件',
      'phone': '电话号码',
      'interests': '兴趣爱好',
      'address': '地址',
      'street': '街道',
      'city': '城市',
      'country': '国家'
    };
    
    for (const [key, value] of Object.entries(schema.properties)) {
      const translatedKey = translations[key] || key;
      const typedValue = value as any;
      translatedProperties[translatedKey] = typedValue;
      
      // Recursively translate nested objects
      if (typedValue.type === 'object' && typedValue.properties) {
        const nestedResult = await mockLLMTranslation(typedValue);
        translatedProperties[translatedKey] = nestedResult;
      }
    }
    
    return {
      type: 'object',
      properties: translatedProperties
    };
  }
  
  // For arrays, we need to translate the items
  if (schema.type === 'array' && schema.items) {
    return {
      type: 'array',
      items: await mockLLMTranslation(schema.items)
    };
  }
  
  // Return unchanged for primitive types
  return schema;
}

async function main() {
  // Example JSON object
  const json = {
    name: 'John Doe',
    age: 30,
    contact: {
      email: 'john.doe@example.com',
      phone: '123-456-7890'
    },
    interests: ['programming', 'music', 'sports'],
    address: {
      street: '123 Main St',
      city: 'Anytown',
      country: 'USA'
    }
  };
  
  console.log('Original JSON:');
  console.log(JSON.stringify(json, null, 2));
  
  // Translate keys from English to Chinese using our mock function
  const result = await translateJsonKeys(json, {
    sourceLanguage: 'en',
    targetLanguage: 'zh',
    translationFn: mockLLMTranslation
  });
  
  console.log('\nTranslated JSON:');
  console.log(JSON.stringify(result.translatedJson, null, 2));
  
  console.log('\nKey Mapping:');
  console.log(JSON.stringify(result.keyMap, null, 2));
}

main().catch(console.error); 