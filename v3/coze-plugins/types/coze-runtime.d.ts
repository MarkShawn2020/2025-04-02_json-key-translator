/**
 * 类型声明文件，用于Coze插件开发
 * 这个文件定义了@/runtime模块的类型以避免TypeScript错误
 */

declare module '@/runtime' {
  /**
   * Coze插件处理函数的参数类型
   */
  export interface Args<T> {
    /**
     * 输入参数
     */
    input: T;
    
    /**
     * 日志记录器
     */
    logger: {
      debug(message: string, ...args: any[]): void;
      info(message: string, ...args: any[]): void;
      warn(message: string, ...args: any[]): void;
      error(message: string, ...args: any[]): void;
    };
  }
} 