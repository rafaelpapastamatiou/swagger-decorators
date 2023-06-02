export const SCHEMAS: { [key: string]: Schema } = {};
export const CLASSES: { [key: string | symbol]: any } = {};

export type SchemaRef = {
  $ref?: any;
  type?: string;
  example?: string;
  items?: {
    $ref?: any;
    type?: string;
  }
}

export type Schema = {
  type: string;
  required?: string[];
  properties: SchemaProperties;
}

export type SchemaProperties = {
  [key: string | symbol]: SchemaProperty;
}

export type SchemaProperty = {
  type: string;
  required?: boolean;
  example?: string;
  items?: SchemaRef;
  properties?: {
    [key: string | symbol]: SchemaProperty;
  };
}