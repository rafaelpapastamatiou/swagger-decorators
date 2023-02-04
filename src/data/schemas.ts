export const SCHEMAS: { [key: string]: Schema } = {};
export let CURRENT_SCHEMA_PROPERTIES: SchemaProperties = {};

export function clearCurrentSchemaProperties() {
  CURRENT_SCHEMA_PROPERTIES = {}
}

export type SchemaRef = {
  $ref?: any;
  type?: string;
  example?: string;
  items?: {
    $ref?: any;
  }
}

export type Schema = {
  type: string;
  required?: string[];
  properties: SchemaProperties;
}

export type SchemaProperties = {
  [key: string]: SchemaProperty;
}

export type SchemaProperty = {
  type: string;
  required?: boolean;
  example?: string;
  items?: SchemaRef;
}