import { PATHS, Param, Path, RequestBody, Responses } from "../data/paths";
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

export function ApiPath({
  path = "",
  tags,
  method,
  description,
  parameters = [],
  responses = {},
  requestBody,
  requestBodySchema,
}: ApiPathProps) {
  for (const key in responses) {
    const responseSchema = responses[key].responseSchema
    const responseMessage = responses[key].responseMessage

    if (responseSchema) {
      const responseSchemaName = typeof responseSchema === "string"
        ? responseSchema
        : responseSchema.name;

      responses[key].content = {
        ...responses[key].content,
        "application/json": {
          schema: formatSwaggerRef(responseSchemaName)
        }
      }

      delete responses[key].responseSchema
    }

    if (responseMessage) {
      responses[key].content = {
        ...responses[key].content,
        "text/plain": {
          schema: {
            type: "string",
            example: responseMessage
          }
        }
      }

      delete responses[key].responseMessage
    }
  }

  let requestBodySchemaName: string | undefined;

  if (requestBodySchema && typeof requestBodySchema === "string") {
    requestBodySchemaName = requestBodySchema;
  }
  else if (requestBodySchema && typeof requestBodySchema === "function") {
    requestBodySchemaName = requestBodySchema.name;
  }

  const newPath: Path = {
    [method]: {
      description,
      parameters,
      tags,
      responses,
      requestBody: requestBodySchemaName
        ? {
          required: true,
          content: {
            "application/json": {
              schema: formatSwaggerRef(requestBodySchemaName)
            }
          }
        }
        : requestBody,
    }
  }

  PATHS[path] = {
    ...PATHS[path],
    ...newPath,
  }

  return (
    _target: any,
    _propertyKey: string,
    _descriptor: PropertyDescriptor,
  ) => {};
}