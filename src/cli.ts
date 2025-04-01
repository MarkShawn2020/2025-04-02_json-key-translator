#!/usr/bin/env node
/**
 * JSON翻译工具命令行接口
 */
import * as fs from 'fs';
import * as path from 'path';
import { translateJsonComplete } from './index';

// 简单的命令行参数解析
const args = process.argv.slice(2);
const helpMessage = `
JSON Translator CLI
用法: json-translator [选项] <输入文件> [输出文件]

选项:
  --help, -h             显示帮助信息
  --key, -k <apiKey>     设置OpenAI API密钥（或使用OPENAI_API_KEY环境变量）
  --language, -l <lang>  设置目标语言（默认：中文）

示例:
  json-translator input.json output.json
  json-translator -l 日语 input.json output.json
  json-translator -k YOUR_API_KEY input.json
`;

// 处理帮助请求
if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  console.log(helpMessage);
  process.exit(0);
}

let apiKey: string | undefined = process.env.OPENAI_API_KEY;
let targetLanguage = '中文';
let inputFile = '';
let outputFile = '';

// 解析参数
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--key' || arg === '-k') {
    apiKey = args[++i];
  } else if (arg === '--language' || arg === '-l') {
    targetLanguage = args[++i];
  } else if (!inputFile) {
    inputFile = arg;
  } else if (!outputFile) {
    outputFile = arg;
  }
}

// 如果没有指定输出文件，使用输入文件名+后缀
if (!outputFile && inputFile) {
  const parsedPath = path.parse(inputFile);
  outputFile = path.join(
    parsedPath.dir, 
    `${parsedPath.name}.translated${parsedPath.ext}`
  );
}

// 验证必须参数
if (!inputFile) {
  console.error('错误: 必须指定输入文件');
  console.log(helpMessage);
  process.exit(1);
}

if (!apiKey) {
  console.error('错误: 必须通过--key选项或OPENAI_API_KEY环境变量提供API密钥');
  process.exit(1);
}

// 主函数
async function main() {
  try {
    console.log(`输入文件: ${inputFile}`);
    console.log(`输出文件: ${outputFile}`);
    console.log(`目标语言: ${targetLanguage}`);
    
    // 读取输入文件
    console.log('读取JSON文件...');
    const jsonString = fs.readFileSync(inputFile, 'utf8');
    const json = JSON.parse(jsonString);
    
    // 翻译JSON
    console.log('翻译JSON...');
    const translatedJson = await translateJsonComplete(json, apiKey!, targetLanguage);
    
    // 写入输出文件
    console.log('写入翻译结果...');
    fs.writeFileSync(outputFile, JSON.stringify(translatedJson, null, 2), 'utf8');
    
    console.log('翻译完成！');
  } catch (error) {
    console.error('翻译失败:', error);
    process.exit(1);
  }
}

// 运行主函数
main(); 