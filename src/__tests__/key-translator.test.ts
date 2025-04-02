/// <reference types="jest" />
import { translateKeys, transformJson } from '../key-translator';

// Mock data
const sampleJson = {
  user: {
    firstName: 'John',
    lastName: 'Doe',
    age: 30,
    address: {
      street: '123 Main St',
      city: 'Anytown'
    }
  }
};

// Mock translation function
async function mockTranslationFn(json: any) {
  // Simple mock that returns a predefined translation
  return {
    keys: ['用户', '名', '姓', '年龄', '地址', '街道', '城市']
  };
}

describe('Key Translator', () => {
  describe('translateKeys', () => {
    it('should translate keys using a custom translation function', async () => {
      const result = await translateKeys(sampleJson, {
        translationFn: mockTranslationFn
      });
      
      // Check that the key map contains the expected mappings
      expect(result.keyMap).toEqual({
        user: '用户',
        firstName: '名',
        lastName: '姓',
        age: '年龄',
        address: '地址',
        street: '街道',
        city: '城市'
      });
      
      // Check that the translated JSON has the expected structure
      expect(result.translatedJson).toHaveProperty('用户');
      expect(result.translatedJson.用户).toHaveProperty('名', 'John');
      expect(result.translatedJson.用户).toHaveProperty('姓', 'Doe');
      expect(result.translatedJson.用户).toHaveProperty('年龄', 30);
      expect(result.translatedJson.用户.地址).toHaveProperty('街道', '123 Main St');
      expect(result.translatedJson.用户.地址).toHaveProperty('城市', 'Anytown');
    });
    
    it('should extend an existing key map', async () => {
      const existingKeyMap = {
        user: '用户',
        firstName: '名'
      };
      
      const result = await translateKeys(sampleJson, {
        translationFn: mockTranslationFn,
        keyMap: existingKeyMap
      });
      
      // Check that the existing mappings are preserved
      expect(result.keyMap.user).toBe('用户');
      expect(result.keyMap.firstName).toBe('名');
      
      // Check that new mappings are added
      expect(result.keyMap.lastName).toBe('姓');
      expect(result.keyMap.address).toBe('地址');
    });
  });
  
  describe('transformJson', () => {
    it('should transform JSON using a key map', () => {
      const keyMap = {
        user: '用户',
        firstName: '名',
        lastName: '姓'
      };
      
      const result = transformJson(sampleJson, keyMap);
      
      // Check that mapped keys are transformed
      expect(result).toHaveProperty('用户');
      expect(result.用户).toHaveProperty('名', 'John');
      expect(result.用户).toHaveProperty('姓', 'Doe');
      
      // Check that unmapped keys remain the same
      expect(result.用户).toHaveProperty('age', 30);
      expect(result.用户).toHaveProperty('address');
    });
    
    it('should handle deep transformation', () => {
      const keyMap = {
        user: '用户',
        address: '地址',
        city: '城市'
      };
      
      const result = transformJson(sampleJson, keyMap, { deep: true });
      
      // Check deep nested transformation
      expect(result.用户.地址).toHaveProperty('城市', 'Anytown');
    });
    
    it('should not transform deep objects when deep is false', () => {
      const keyMap = {
        user: '用户',
        address: '地址',
        city: '城市'
      };
      
      const result = transformJson(sampleJson, keyMap, { deep: false });
      
      // Check that only top-level keys are transformed
      expect(result).toHaveProperty('用户');
      
      // Inner objects should remain unchanged
      expect(result.用户).toHaveProperty('address');
      
      // Inner properties should remain unchanged
      expect(result.用户.address.city).toBe('Anytown');
    });
  });
}); 