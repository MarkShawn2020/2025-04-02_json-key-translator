import { translateJsonKeys } from '../src';
import fetch from 'node-fetch';

// Example of how to integrate with a real LLM service (using a hypothetical API)
async function llmTranslationFunction(schema: any, options: any): Promise<any> {
  const { sourceLanguage, targetLanguage } = options;
  
  console.log(`Translating schema from ${sourceLanguage} to ${targetLanguage}`);
  console.log('Schema:', JSON.stringify(schema, null, 2));
  
  // Example prompt for the LLM
  const prompt = `
I need you to translate the keys in this JSON schema from ${sourceLanguage} to ${targetLanguage}.
Only translate the keys, not the values or structure.
Keep the same JSON structure, just return a new JSON with translated keys.

Here's the schema:
${JSON.stringify(schema, null, 2)}

Return only the translated JSON schema with no additional text.
`;

  try {
    // This is a hypothetical API call - you would replace this with your actual LLM API
    // Uncomment and modify to use a real API
    /*
    const response = await fetch('https://api.deepseek.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'user', 
            content: prompt 
          }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const translatedSchemaText = data.choices[0].message.content;
    
    // Parse the response text into a JSON object
    return JSON.parse(translatedSchemaText);
    */
    
    // For this example, just mock the translation
    console.log('Using mock translation since this is just an example');
    return mockLLMTranslation(schema);
  } catch (error) {
    console.error('Error calling LLM API:', error);
    throw error;
  }
}

// Mock translation function for the example
function mockLLMTranslation(schema: any): any {
  if (schema.type === 'object' && schema.properties) {
    const translations: Record<string, string> = {
      'user': '用户',
      'name': '姓名',
      'email': '电子邮件',
      'age': '年龄',
      'address': '地址',
      'street': '街道',
      'city': '城市',
      'country': '国家',
      'preferences': '偏好',
      'language': '语言',
      'theme': '主题',
      'notifications': '通知',
      'enabled': '启用',
      'frequency': '频率'
    };
    
    const translatedProps: Record<string, any> = {};
    
    for (const [key, value] of Object.entries<any>(schema.properties)) {
      const translatedKey = translations[key] || key;
      
      if (value.type === 'object' && value.properties) {
        translatedProps[translatedKey] = mockLLMTranslation(value);
      } else if (value.type === 'array' && value.items) {
        translatedProps[translatedKey] = {
          type: 'array',
          items: mockLLMTranslation(value.items)
        };
      } else {
        translatedProps[translatedKey] = value;
      }
    }
    
    return {
      type: 'object',
      properties: translatedProps
    };
  }
  
  return schema;
}

async function main() {
  // Complex JSON example
  const userProfile = {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      age: 35
    },
    address: {
      street: '123 Main St',
      city: 'San Francisco',
      country: 'USA'
    },
    preferences: {
      language: 'English',
      theme: 'Dark',
      notifications: {
        enabled: true,
        frequency: 'daily'
      }
    }
  };
  
  console.log('Original JSON:');
  console.log(JSON.stringify(userProfile, null, 2));
  
  // Translate using the LLM function
  const result = await translateJsonKeys(userProfile, {
    sourceLanguage: 'en',
    targetLanguage: 'zh',
    translationFn: llmTranslationFunction
  });
  
  console.log('\nTranslated JSON:');
  console.log(JSON.stringify(result.translatedJson, null, 2));
  
  console.log('\nKey Mapping:');
  console.log(JSON.stringify(result.keyMap, null, 2));
}

main().catch(console.error); 