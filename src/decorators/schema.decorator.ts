import {
  CURRENT_SCHEMA_PROPERTIES,
  CURRENT_SCHEMA_NAME,
  ALL_LOADED_CLASSES,
  SCHEMAS,
  Schema,
  SchemaProperty,
  clearCurrentSchemaProperties,
  changeCurrentSchemaName,
} from "../data/schemas"

import { formatSwaggerRef } from "../utils/format-swagger-ref";

const supportedTypes = new Set([
  "string",
  "date",
  "number",
  "boolean",
  "array"
])

export function ApiSchema() {
  return (constructor: Function) => {
    if (SCHEMAS[constructor.name]) {
      clearCurrentSchemaProperties()
      return
    }

    const required: string[] = [];

    for (const key in CURRENT_SCHEMA_PROPERTIES) {
      if (CURRENT_SCHEMA_PROPERTIES[key].required) {
        required.push(key)
      }

      delete CURRENT_SCHEMA_PROPERTIES[key].required
    }

    const newSchema: Schema = {
      type: "object",
      required: required.length > 0
        ? required
        : undefined,
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
  arrayItemClass?: Function;
  arrayItemSchema?: string;
}

export function ApiSchemaProperty({
  required,
  example,
  type,
  arrayItemClass,
  arrayItemSchema,
}: ApiSchemaPropertyProps = {}): PropertyDecorator {
  return (target, propertyKey) => {
    if (!CURRENT_SCHEMA_NAME) {
      changeCurrentSchemaName(target.constructor.name)
    }

    if (
      CURRENT_SCHEMA_NAME &&
      CURRENT_SCHEMA_NAME !== target.constructor.name
    ) {
      changeCurrentSchemaName(target.constructor.name)
      clearCurrentSchemaProperties()
    }

    let originalPropertyType = Reflect.getMetadata(
      "design:type",
      target,
      propertyKey,
    ).name;

    if (!originalPropertyType) {
      originalPropertyType = type;
    }

    if (!originalPropertyType) {
      throw new Error(
        `Reflection could not detect the type for the property ${propertyKey.toString()}. Please, pass it manually using the "type" prop.`
      )
    }

    let propertyType = originalPropertyType.toLowerCase()

    if (!supportedTypes.has(originalPropertyType.toLowerCase())) {
      propertyType = "object";
    }

    if (propertyType === "date") {
      propertyType = "string";
    }

    if (
      propertyType === "array" &&
      !arrayItemClass &&
      !arrayItemSchema
    ) {
      throw new Error("You must pass a Class or a Schema to be the shape of the array items")
    }

    let items

    if (propertyType === "array" && arrayItemSchema) {
      propertyType = `Array:Schema:${arrayItemSchema}`
      items = formatSwaggerRef(arrayItemSchema)
    }
    if (propertyType === "array" && arrayItemClass) {
      propertyType = `Array:Class:${arrayItemClass.name}`
      items = generateArrayDefinitionFromClass({
        classDefinition: arrayItemClass
      })
    }

    let properties
    if (propertyType === "object") {
      properties = getObjectProperties(originalPropertyType)
    }

    const formattedPropertyType = propertyType.startsWith("Array:")
      ? "array"
      : propertyType.toLowerCase()

    const newSchemaProperty: SchemaProperty = {
      type: type || formattedPropertyType,
      example,
      required,
      items,
      properties
    };

    CURRENT_SCHEMA_PROPERTIES[propertyKey] = newSchemaProperty

    ALL_LOADED_CLASSES[target.constructor.name] = {
      ...(ALL_LOADED_CLASSES[target.constructor.name] || {}),
      [propertyKey]: {
        type: propertyType === "object"
          ? originalPropertyType
          : propertyType,
        example,
        required,
      }
    }
  };
}

interface GenerateArrayDefinitionFromClassProps {
  classDefinition: Function;
}
function generateArrayDefinitionFromClass({
  classDefinition,
}: GenerateArrayDefinitionFromClassProps) {
  const name = classDefinition.name

  if (supportedTypes.has(name.toLowerCase())) {
    return { type: name.toLowerCase() }
  }

  const arrayType = getObjectProperties(name)

  return { type: "object", properties: arrayType }
}

function getObjectProperties(className: string) {
  const data = ALL_LOADED_CLASSES[className]

  if (!data) return undefined

  for (const key in data) {
    const type = data[key].type

    if (supportedTypes.has(type.toLowerCase())) continue

    if (type.startsWith("Array:")) {
      const [
        _,
        definitionType,
        value
      ] = type.split(":")

      if (definitionType === "Class") {
        const arrayItemData = getObjectProperties(value)

        let items

        if (arrayItemData) {
          items = { type: "object", properties: arrayItemData }
        }
        else if (supportedTypes.has(value.toLowerCase())) {
          items = { type: value.toLowerCase() }
        }

        data[key] = {
          type: "array",
          items,
        }
      }
      else {
        data[key] = {
          type: "array",
          items: formatSwaggerRef(value)
        }
      }
    }
    else {
      data[key] = {
        type: "object",
        properties: getObjectProperties(data[key].type)
      }
    }
  }

  return data
}