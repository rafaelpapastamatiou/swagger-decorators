import {
  SCHEMAS,
  CLASSES,
  SchemaProperty,
} from "../data/schemas"

const supportedTypes = new Set([
  "String",
  "Date",
  "Number",
  "Boolean",
  "Array"
])

const supportedTypesLowerCase = new Set([
  "string",
  "date",
  "number",
  "boolean",
  "array"
])

interface ApiSchemaPropertyProps {
  type?: string | Function;
  required?: boolean;
  example?: string;
  debug?: boolean;
}

export function ApiSchema() {
  return (constructor: Function) => {
    const constructorName = constructor.name;

    const c = CLASSES[constructorName];

    if (!c) return;

    const required: string[] = [];

    const newC: {[key: string | symbol]: any} = {};
    
    for (const key in c) {
      if (c[key].required) {
        required.push(key)
      }

      const { required: _req, ...propData } = c[key];
      newC[key] = propData;
    }

    SCHEMAS[constructorName] = {
      type: "object",
      properties: newC,
      required: required.length > 0
        ? required
        : undefined,
    };
  }
}

export function ApiSchemaProperty({
  required,
  example,
  type,
  debug = false
}: ApiSchemaPropertyProps = {}): PropertyDecorator {
  return (target, propertyKey) => {
    const constructorName = target.constructor.name;

    if (debug) console.log("Constructor name: ", constructorName);
    if (debug) console.log(`Property key: ${propertyKey.toString()}`);

    if (!CLASSES[constructorName]) {
      CLASSES[constructorName] = {}
    }

    const originalPropertyType = Reflect.getMetadata(
      "design:type",
      target,
      propertyKey,
    ).name;

    type = checkType(type);

    if (!originalPropertyType && !type) { 
      throw new Error(
        `Reflection could not detect the type for the property ${propertyKey.toString()}. Please, pass it manually using the "type" prop.`
      );
    }

    if (debug) {
      console.log(`Original Property type: ${originalPropertyType}`);
      console.log(`Type (manually): ${type}`);
    }

    let realPropertyType, items, properties;

    if (!supportedTypes.has(originalPropertyType)) {
      realPropertyType = "object";
      properties = generateClassDefinition(originalPropertyType)
    }
    else if (originalPropertyType === "Date") {
      realPropertyType = "string";
    }
    else if (originalPropertyType === "Array") {
      if (!type) {
        throw new Error(
          `You must explicitly pass the type if using an array.`
        );
      }

      realPropertyType = `Array:${type}`;
      items = generateArrayDefinition(type);
    }
    else {
      realPropertyType = originalPropertyType.toLowerCase();
    }

    if (debug) console.log(`Real property type: ${realPropertyType}`);
    
    const formattedPropertyType = realPropertyType.startsWith("Array:")
      ? "array"
      : realPropertyType.toLowerCase();

    if (debug) console.log(`Formatted property type: ${realPropertyType}`);

    const schemaProperty: SchemaProperty = {
      type: type || formattedPropertyType,
      example,
      required,
      items,
      properties,
    }

    CLASSES[constructorName][propertyKey] = {
      ...schemaProperty,
      type: formattedPropertyType === "object"
        ? originalPropertyType
        : formattedPropertyType,
    };
    
    if (debug) console.log("\n");
  }
}

function checkType(type?: string | Function): string | undefined {
  if (!type) return undefined;

  if (typeof type === "string") return type;

  return type.prototype.constructor.name;
}

function generateArrayDefinition(constructorName: string) {
  if (supportedTypes.has(constructorName)) {
    return { type: constructorName.toLowerCase() };
  }

  const classDefinition = generateClassDefinition(constructorName);

  return { type: "object", properties: classDefinition };
}

function generateClassDefinition(className: string) {
  const c = CLASSES[className];

  if (!c) return undefined;

  for (const key in c) {
    const type = c[key].type;

    if (supportedTypesLowerCase.has(type)) continue;
    
    if (type.startsWith("Array:")) {
      const [
        _,
        itemClassName,
      ] = type.split(":");

      const arrayItemClassDefinition = generateClassDefinition(
        itemClassName
      );

      let items

      if (arrayItemClassDefinition) {
        items = {
          type: "object",
          properties: arrayItemClassDefinition,
        };
      }
      else if(supportedTypes.has(itemClassName)) {
        items = { type: itemClassName.toLowerCase() };
      }

      c[key] = {
        type: "array",
        items,
      }
    }
    else {
      c[key] = {
        type: "object",
        properties: generateClassDefinition(type),
      }
    }
  }

  return c;
}