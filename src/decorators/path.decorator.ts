import { PATHS, Param, Path, RequestBody, Responses } from "../data/paths";
import { formatSwaggerRef } from "../utils/format-swagger-ref";

interface ApiPathProps {
  path?: string;
  method: "get" | "post" | "put" | "delete" | "patch";
  description?: string;
  parameters?: Param[];
  requestBodySchema?: string;
  requestBody?: RequestBody;
  responses?: Responses;
}

export function ApiPath({
  path = "",
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
    const responseContent = responses[key].content

    if (!responseSchema && !responseContent && !responseMessage) {
      throw new Error("Response must have content, schema or message.")
    }

    if (responseSchema) {
      responses[key].content = {
        ...responses[key].content,
        "application/json": {
          schema: formatSwaggerRef(responseSchema)
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

  const newPath: Path = {
    [method]: {
      description,
      parameters,
      responses,
      requestBody: requestBodySchema
        ? {
          required: true,
          content: {
            "application/json": {
              schema: formatSwaggerRef(requestBodySchema)
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