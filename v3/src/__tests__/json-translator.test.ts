import { translateJsonKeys, applyTranslatedKeys, generateKeySchema } from '../';

describe('JSON Key Translator', () => {
  describe('generateKeySchema', () => {
    it('should convert JSON to schema with key focus', () => {
      const input = {
        name: 'Test',
        age: 25,
        nested: {
          prop: 'value'
        },
        items: ['a', 'b', 'c']
      };
      
      const result = generateKeySchema(input);
      
      expect(result).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          nested: { 
            type: 'object', 
            properties: {
              prop: { type: 'string' }
            }
          },
          items: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      });
    });
  });
  
  describe('applyTranslatedKeys', () => {
    it('should apply key mapping to JSON object', () => {
      const input = {
        name: 'Test',
        age: 25,
        nested: {
          prop: 'value'
        }
      };
      
      const keyMap = {
        'name': 'translated_name',
        'age': 'translated_age',
        'nested': 'translated_nested',
        'prop': 'translated_prop'
      };
      
      const result = applyTranslatedKeys(input, keyMap);
      
      expect(result).toEqual({
        translated_name: 'Test',
        translated_age: 25,
        translated_nested: {
          translated_prop: 'value'
        }
      });
    });
    
    it('should handle arrays correctly', () => {
      const input = {
        items: [
          { name: 'Item 1' },
          { name: 'Item 2' }
        ]
      };
      
      const keyMap = {
        'items': 'translated_items',
        'name': 'translated_name'
      };
      
      const result = applyTranslatedKeys(input, keyMap);
      
      expect(result).toEqual({
        translated_items: [
          { translated_name: 'Item 1' },
          { translated_name: 'Item 2' }
        ]
      });
    });
    
    it('should preserve original keys when requested', () => {
      const input = {
        name: 'Test',
        age: 25
      };
      
      const keyMap = {
        'name': 'translated_name',
        'age': 'translated_age'
      };
      
      const result = applyTranslatedKeys(input, keyMap, true);
      
      expect(result).toEqual({
        name: 'Test',
        translated_name: 'Test',
        age: 25,
        translated_age: 25
      });
    });
  });
  
  describe('translateJsonKeys', () => {
    it('should translate JSON keys using provided translation function', async () => {
      const mockTranslationFn = jest.fn().mockImplementation((schema) => {
        // Simple translation that prefixes keys with 'tr_'
        if (schema.type === 'object' && schema.properties) {
          const translatedProps: Record<string, any> = {};
          
          for (const [key, value] of Object.entries(schema.properties)) {
            translatedProps[`tr_${key}`] = value;
          }
          
          return {
            type: 'object',
            properties: translatedProps
          };
        }
        
        return schema;
      });
      
      const input = {
        name: 'Test',
        age: 25
      };
      
      const result = await translateJsonKeys(input, {
        translationFn: mockTranslationFn
      });
      
      expect(result.translatedJson).toEqual({
        tr_name: 'Test',
        tr_age: 25
      });
      
      expect(result.keyMap).toEqual({
        name: 'tr_name',
        age: 'tr_age'
      });
      
      expect(mockTranslationFn).toHaveBeenCalled();
    });
  });
}); 