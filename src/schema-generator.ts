/**
 * 根据JSON对象生成JSON schema
 * 将所有值转换为其类型描述，保留键名
 */

// 确定JSON值的类型
function getValueType(value: any): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * 生成JSON schema
 * @param json - 输入的JSON对象
 * @returns JSON schema对象
 */
export function generateSchema(json: Record<string, any>): Record<string, any> {
  const schema: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(json)) {
    if (value === null) {
      schema[key] = 'null';
    } else if (Array.isArray(value)) {
      if (value.length > 0) {
        // 对数组中的第一个元素进行类型判断
        const itemType = getValueType(value[0]);
        if (itemType === 'object') {
          // 如果数组包含对象，则递归生成schema
          schema[key] = {
            type: 'array',
            items: generateSchema(value[0])
          };
        } else {
          schema[key] = {
            type: 'array',
            items: { type: itemType }
          };
        }
      } else {
        schema[key] = {
          type: 'array',
          items: { type: 'any' }
        };
      }
    } else if (typeof value === 'object') {
      // 递归处理嵌套对象
      schema[key] = generateSchema(value);
    } else {
      schema[key] = typeof value;
    }
  }
  
  return schema;
} 