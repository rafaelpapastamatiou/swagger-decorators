import { SchemaRef } from "src/data/schemas";
import { PATHS, CONTROLLERS, Param, Path, RequestBody, Responses, Response } from "../data/paths";
import { formatSwaggerRef } from "../utils/format-swagger-ref";

interface ApiPathProps {
  path?: string;
  method: "get" | "post" | "put" | "delete" | "patch";
  tags?: string[];
  description?: string;
  parameters?: Param[];
  requestBodySchema?: string | Function;
  requestBody?: RequestBody;
  responses?: Responses;
}

export function ApiTags(tags: string | string[]) {
  return (
    target: any,
    propertyKey: string,
    _descriptor: PropertyDescriptor,
  ) => {
    const constructorName = target.constructor.name;
    prepareController(constructorName, propertyKey);

    tags = Array.isArray(tags) ? tags : [tags];

    CONTROLLERS[constructorName][propertyKey].tags = tags;
  };
}

interface ApiBodyProps {
  schema: string | Function;
  description?: string;
}
export function ApiBody({
  schema,
  description,
}: ApiBodyProps) {
  return (
    target: any,
    propertyKey: string,
    _descriptor: PropertyDescriptor,
  ) => {
    const constructorName = target.constructor.name;
    prepareController(constructorName, propertyKey);

    let requestBodySchemaName: string | undefined;

    if (schema && typeof schema === "string") {
      requestBodySchemaName = schema;
    }
    else if (schema && typeof schema === "function") {
      requestBodySchemaName = schema.name;
    }

    CONTROLLERS[constructorName][propertyKey].requestBody = {
      required: true,
      description,
      content: {
        "application/json": {
          schema: formatSwaggerRef(requestBodySchemaName),
        }
      }
    };
  };
}

type ApiResponseProps = Response & {
  status: number;
}
export function ApiResponse({
  status,
  content,
  description,
  message,
  schema
}: ApiResponseProps) {
  return (
    target: any,
    propertyKey: string,
    _descriptor: PropertyDescriptor,
  ) => {
    const constructorName = target.constructor.name;
    prepareController(constructorName, propertyKey);

    if (!CONTROLLERS[constructorName][propertyKey].responses) {
      CONTROLLERS[constructorName][propertyKey].responses = {};
    }

    const response: Response = {
      content: {},
    };

    if (content) {
      response.content = content;
    }

    if (schema) {
      const schemaName = typeof schema === "string"
        ? schema
        : schema.name;

      response.content = {
        ...response.content,
        "application/json": {
          schema: formatSwaggerRef(schemaName)
        }
      }
    }

    if (message) {
      response.content = {
        ...response.content,
        "text/plain": {
          schema: {
            type: "string",
            example: message
          }
        }
      }
    }

    if (!description) {
      response.description = defaultDescriptions[status] || ""
    }

    CONTROLLERS[constructorName][propertyKey].responses![status] = response;
  };
}

interface ApiParamProps {
  name: string;
  example?: string;
  description?: string;
}
export function ApiParam({
  name,
  example,
  description,
}: ApiParamProps) {
  return (
    target: any,
    propertyKey: string,
    _descriptor: PropertyDescriptor,
  ) => {
    const constructorName = target.constructor.name;
    prepareController(constructorName, propertyKey);

    if (!CONTROLLERS[constructorName][propertyKey].parameters) {
      CONTROLLERS[constructorName][propertyKey].parameters = [];
    }

    CONTROLLERS[constructorName][propertyKey].parameters!.push({
      in: "path",
      name,
      required: true,
      schema: {
        example,
        type: "string",
      },
      description,
    });
  };
}

interface ApiQueryProps {
  name: string;
  required?: boolean;
  type: "string" | "number";
  isArray?: boolean;
  example?: string;
  description?: string;
}
export function ApiQuery({
  name,
  required = false,
  type,
  isArray = false,
  example,
  description,
}: ApiQueryProps) {
  return (
    target: any,
    propertyKey: string,
    _descriptor: PropertyDescriptor,
  ) => {
    const constructorName = target.constructor.name;
    prepareController(constructorName, propertyKey);

    if (!CONTROLLERS[constructorName][propertyKey].parameters) {
      CONTROLLERS[constructorName][propertyKey].parameters = [];
    }

    let schema: SchemaRef;

    if (isArray) {
      schema = {
        type: "array",
        items: {
          type,
        },
        example,
      }
    }
    else {
      schema = {
        example,
        type,
      }
    }

    CONTROLLERS[constructorName][propertyKey].parameters!.push({
      in: "query",
      name,
      required,
      schema,
      description,
    });
  };
}

interface ApiHeaderProps {
  name: string;
  required?: boolean;
  type: "string" | "number";
  isArray?: boolean;
  example?: string;
  description?: string;
}
export function ApiHeader({
  name,
  type,
  isArray,
  example,
  required = false,
  description,
}: ApiHeaderProps) {
  return (
    target: any,
    propertyKey: string,
    _descriptor: PropertyDescriptor,
  ) => {
    const constructorName = target.constructor.name;
    prepareController(constructorName, propertyKey);

    if (!CONTROLLERS[constructorName][propertyKey].parameters) {
      CONTROLLERS[constructorName][propertyKey].parameters = [];
    }

    let schema: SchemaRef;

    if (isArray) {
      schema = {
        type: "array",
        items: {
          type,
        },
        example,
      }
    }
    else {
      schema = {
        example,
        type,
      }
    }

    CONTROLLERS[constructorName][propertyKey].parameters!.push({
      in: "header",
      name,
      required,
      schema,
      description,
    });
  };
}

interface ApiRouteProps {
  method: "get" | "post" | "put" | "delete" | "patch";
  path: string;
}
export function ApiRoute({
  method,
  path,
}: ApiRouteProps) {
  return (
    target: any,
    propertyKey: string,
    _descriptor: PropertyDescriptor,
  ) => {
    const constructorName = target.constructor.name;
    prepareController(constructorName, propertyKey);

    PATHS[path] = {
      ...PATHS[path],
      [method]: CONTROLLERS[constructorName][propertyKey],
    }

    console.log("PATHS", PATHS);
  };
}


function prepareController(controller: string, method: string) {
  if (!CONTROLLERS[controller]) {
    CONTROLLERS[controller] = {};
  };

  if (!CONTROLLERS[controller][method]) {
    CONTROLLERS[controller][method] = {};
  };
}

const defaultDescriptions: { [key: string]: string; } = {
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing",
  103: "Early Hints",
  200: "Success",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  207: "Multi-Status",
  208: "Already Reported",
  226: "IM Used",
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  510: "Not Extended",
  511: "Network Authentication Required",
}
