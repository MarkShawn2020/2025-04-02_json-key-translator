import axios from 'axios';
import { BaseTranslator } from './base-translator';
import { TranslationOptions } from '../types';

/**
 * Google翻译服务实现
 */
export class GoogleTranslator extends BaseTranslator {
  private readonly endpoint = 'https://translation.googleapis.com/language/translate/v2';

  constructor(options: TranslationOptions) {
    super(options);
    if (!this.apiKey) {
      this.logger('Google翻译需要API密钥', 'error');
      throw new Error('Google翻译需要API密钥');
    }
  }

  /**
   * 翻译单个文本
   */
  async translate(text: string): Promise<string> {
    try {
      this.logger(`翻译文本: ${text}`, 'debug');
      
      const response = await axios.post(this.endpoint, null, {
        params: {
          q: text,
          source: this.sourceLanguage,
          target: this.targetLanguage,
          format: 'text',
          key: this.apiKey
        }
      });
      
      if (response.data && 
          response.data.data && 
          response.data.data.translations && 
          response.data.data.translations.length > 0) {
        const result = response.data.data.translations[0].translatedText;
        this.logger(`翻译结果: ${result}`, 'debug');
        return result;
      } else {
        throw new Error('翻译响应格式错误');
      }
    } catch (error) {
      const errorMsg = error instanceof Error 
        ? error.message 
        : '未知错误';
      
      this.logger(`Google翻译失败: ${errorMsg}`, 'error');
      throw new Error(`Google翻译失败: ${errorMsg}`);
    }
  }

  /**
   * 批量翻译 - 利用Google API批量能力
   */
  async batchTranslate(texts: string[]): Promise<string[]> {
    if (texts.length === 0) return [];
    
    try {
      this.logger(`批量翻译 ${texts.length} 个文本`, 'info');
      
      const response = await axios.post(this.endpoint, null, {
        params: {
          q: texts,
          source: this.sourceLanguage,
          target: this.targetLanguage,
          format: 'text',
          key: this.apiKey
        }
      });
      
      if (response.data && 
          response.data.data && 
          response.data.data.translations) {
        const results = response.data.data.translations.map(
          (t: any) => t.translatedText
        );
        
        return results;
      } else {
        throw new Error('批量翻译响应格式错误');
      }
    } catch (error) {
      const errorMsg = error instanceof Error 
        ? error.message 
        : '未知错误';
      
      this.logger(`Google批量翻译失败: ${errorMsg}`, 'error');
      
      // 如果批量失败，尝试转为逐个翻译
      this.logger('尝试退回到逐个翻译', 'info');
      return super.batchTranslate(texts);
    }
  }
} 