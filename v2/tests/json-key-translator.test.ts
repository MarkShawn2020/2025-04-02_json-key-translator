import { createJsonKeyTranslator } from '../src';
import { JsonKeyTranslator } from '../src/types';

describe('JsonKeyTranslator', () => {
  let mockTranslateFunction: jest.Mock;
  let translator: JsonKeyTranslator;
  
  beforeEach(() => {
    // 创建模拟翻译函数
    mockTranslateFunction = jest.fn().mockImplementation((text: string) => {
      // 简单翻译规则：加上 '_translated' 后缀
      return Promise.resolve(`${text}_translated`);
    });
    
    // 使用自定义翻译函数初始化翻译器
    translator = createJsonKeyTranslator({
      provider: 'custom',
      customTranslator: mockTranslateFunction
    });
  });
  
  test('应该正确翻译单个键', async () => {
    const result = await translator.translateKey('hello');
    expect(result).toBe('hello_translated');
    expect(mockTranslateFunction).toHaveBeenCalledTimes(1);
  });
  
  test('应该正确翻译平面JSON对象的键', async () => {
    const json = {
      name: 'John',
      age: 30,
      email: 'john@example.com'
    };
    
    const translated = await translator.translateKeys(json);
    
    expect(translated).toEqual({
      name_translated: 'John',
      age_translated: 30,
      email_translated: 'john@example.com'
    });
    
    // 应该为每个键调用一次翻译函数
    expect(mockTranslateFunction).toHaveBeenCalledTimes(3);
  });
  
  test('应该正确翻译嵌套JSON对象的键', async () => {
    const json = {
      user: {
        name: 'John',
        address: {
          city: 'New York',
          country: 'USA'
        }
      },
      active: true
    };
    
    const translated = await translator.translateKeys(json);
    
    expect(translated).toEqual({
      user_translated: {
        name_translated: 'John',
        address_translated: {
          city_translated: 'New York',
          country_translated: 'USA'
        }
      },
      active_translated: true
    });
  });
  
  test('应该正确处理数组', async () => {
    const json = {
      users: [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ]
    };
    
    const translated = await translator.translateKeys(json);
    
    expect(translated).toEqual({
      users_translated: [
        { name_translated: 'John', age_translated: 30 },
        { name_translated: 'Jane', age_translated: 25 }
      ]
    });
  });
  
  test('应该使用缓存避免重复翻译', async () => {
    // 首次翻译
    await translator.translateKey('hello');
    expect(mockTranslateFunction).toHaveBeenCalledTimes(1);
    
    // 再次翻译相同的键应该使用缓存
    await translator.translateKey('hello');
    expect(mockTranslateFunction).toHaveBeenCalledTimes(1); // 不应该增加调用次数
    
    // 清除缓存
    translator.clearCache();
    
    // 现在应该重新调用翻译函数
    await translator.translateKey('hello');
    expect(mockTranslateFunction).toHaveBeenCalledTimes(2);
  });
}); 