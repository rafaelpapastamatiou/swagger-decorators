export const SCHEMAS: { [key: string]: Schema } = {};
export let CURRENT_SCHEMA_PROPERTIES: SchemaProperties = {};
export let ALL_LOADED_CLASSES: AllLoadedClassesProperties = {};

export function clearCurrentSchemaProperties() {
  CURRENT_SCHEMA_PROPERTIES = {}
}

export let CURRENT_SCHEMA_NAME = ""

export function changeCurrentSchemaName(newName: string) {
  CURRENT_SCHEMA_NAME = newName
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
  [key: string | symbol]: SchemaProperty;
}

export type AllLoadedClassesProperties = {
  [key: string | symbol]: any;

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