declare module 'to-json-schema' {
  interface ToJsonSchemaOptions {
    required?: boolean;
    additionalProperties?: boolean;
    arrays?: {
      mode?: 'all' | 'first' | 'sample';
      sample?: number;
    };
    objects?: {
      additionalProperties?: boolean;
      postProcessFnc?: (generatedSchema: any, obj: any) => any;
    };
    strings?: {
      detectFormat?: boolean;
      postProcessFnc?: (generatedSchema: any, str: string) => any;
    };
    postProcessFnc?: (generatedSchema: any, obj: any) => any;
  }

  function toJsonSchema(
    obj: any,
    options?: ToJsonSchemaOptions
  ): any;

  export = toJsonSchema;
} 