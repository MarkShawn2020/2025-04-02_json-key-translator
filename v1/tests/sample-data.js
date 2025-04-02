/**
 * 测试数据
 */

// 示例JSON数据
const sampleJson = {
  product: {
    name: "Smart Watch Pro",
    price: 199.99,
    description: "Advanced smartwatch with health monitoring features",
    specifications: {
      display: "AMOLED 1.5 inch",
      battery: "300mAh",
      waterResistant: true,
      sensors: ["Heart Rate", "SpO2", "Temperature"]
    },
    colors: ["Black", "Silver", "Gold"],
    rating: 4.8
  },
  manufacturer: {
    name: "TechGear Inc.",
    country: "USA",
    yearFounded: 2005,
    contact: {
      email: "support@techgear.com",
      phone: "+1-123-456-7890"
    }
  },
  shipping: {
    methods: [
      {
        type: "Standard",
        price: 5.99,
        estimatedDays: "3-5"
      },
      {
        type: "Express",
        price: 15.99,
        estimatedDays: "1-2"
      }
    ],
    international: true
  }
};

// 示例翻译中间体（从英文到中文）
const sampleTranslationMap = {
  "product": {
    "original": "product",
    "translated": "产品",
    "children": {
      "name": {
        "original": "name",
        "translated": "名称"
      },
      "price": {
        "original": "price",
        "translated": "价格"
      },
      "description": {
        "original": "description",
        "translated": "描述"
      },
      "specifications": {
        "original": "specifications",
        "translated": "规格",
        "children": {
          "display": {
            "original": "display",
            "translated": "显示屏"
          },
          "battery": {
            "original": "battery",
            "translated": "电池"
          },
          "waterResistant": {
            "original": "waterResistant",
            "translated": "防水"
          },
          "sensors": {
            "original": "sensors",
            "translated": "传感器"
          }
        }
      },
      "colors": {
        "original": "colors",
        "translated": "颜色"
      },
      "rating": {
        "original": "rating",
        "translated": "评分"
      }
    }
  },
  "manufacturer": {
    "original": "manufacturer",
    "translated": "制造商",
    "children": {
      "name": {
        "original": "name",
        "translated": "名称"
      },
      "country": {
        "original": "country",
        "translated": "国家"
      },
      "yearFounded": {
        "original": "yearFounded",
        "translated": "成立年份"
      },
      "contact": {
        "original": "contact",
        "translated": "联系方式",
        "children": {
          "email": {
            "original": "email",
            "translated": "电子邮箱"
          },
          "phone": {
            "original": "phone",
            "translated": "电话"
          }
        }
      }
    }
  },
  "shipping": {
    "original": "shipping",
    "translated": "配送",
    "children": {
      "methods": {
        "original": "methods",
        "translated": "方式",
        "children": {
          "type": {
            "original": "type",
            "translated": "类型"
          },
          "price": {
            "original": "price",
            "translated": "价格"
          },
          "estimatedDays": {
            "original": "estimatedDays",
            "translated": "预计天数"
          }
        }
      },
      "international": {
        "original": "international",
        "translated": "国际"
      }
    }
  }
};

module.exports = { sampleJson, sampleTranslationMap }; 