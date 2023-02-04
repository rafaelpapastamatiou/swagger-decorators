import { CURRENT_SCHEMA_PROPERTIES, SCHEMAS, Schema, SchemaProperty, SchemaRef, clearCurrentSchemaProperties } from "../data/schemas"
import { formatSwaggerRef } from "../utils/format-swagger-ref";

export function ApiSchema() {
  return (constructor: Function) => {
    const required: string[] = [];

    for (const key in CURRENT_SCHEMA_PROPERTIES) {
      if (CURRENT_SCHEMA_PROPERTIES[key].required) {
        required.push(key)
      }

      delete CURRENT_SCHEMA_PROPERTIES[key].required
    }

    const newSchema: Schema = {
      type: "object",
      required,
      properties: CURRENT_SCHEMA_PROPERTIES,
    };

    SCHEMAS[constructor.name] = newSchema;
    clearCurrentSchemaProperties()
  }
}

interface ApiSchemaPropertyProps {
  type?: string;
  required?: boolean;
  example?: string;
  items?: SchemaRef;
}

export function ApiSchemaProperty({
  required,
  example,
  items,
  type,
}: ApiSchemaPropertyProps) {
  return (target: any, propertyKey: string) => {
    const propertyType: string = Reflect.getMetadata(
      "design:type",
      target,
      propertyKey,
    ).name;

    const newSchemaProperty: SchemaProperty = {
      type: type || propertyType.toLowerCase(),
      example,
      required,
      items: items && items.$ref
        ? formatSwaggerRef(items.$ref)
        : undefined,
    };

    CURRENT_SCHEMA_PROPERTIES[propertyKey] = newSchemaProperty
  };
}