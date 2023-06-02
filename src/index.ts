import "reflect-metadata"
import glob from "glob-promise"
import fs from "fs/promises"

import { PATHS, clearPaths } from "./data/paths";
import { SCHEMAS, clearSchemas } from "./data/schemas";

export {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiHeader,
  ApiRoute,
  ApiBearerAuth,
  ApiKeyAuth,
} from "./decorators/path.decorator"
export { ApiSchema, ApiSchemaProperty } from "./decorators/schema.decorator"
export { formatSwaggerRef } from "./utils/format-swagger-ref"

interface GenerateSwaggerFileProps {
  controllersGlob: string;
  schemasGlob: string;
  swaggerFilePath: string;
  base: {
    openapi: string;
    info: {
      title: string;
      version: string;
    };
    servers: {
      url: string;
      description: string;
    }[];
  };
  bearer?: boolean | {
    format: string;
  };
  apiKey?: boolean | {
    headerName: string;
  };
}

export async function generateSwaggerFile({
  controllersGlob,
  schemasGlob,
  base,
  swaggerFilePath,
  bearer,
  apiKey,
}: GenerateSwaggerFileProps) {
  const [schemas, controllers] = await Promise.all([
    glob.promise(schemasGlob),
    glob.promise(controllersGlob),
  ])

  for (const schema of schemas) {
    await import(schema)
    //clearLoadedClasses();
  }

  for (const controller of controllers) {
    await import(controller)
  }

  let securitySchemes: { [key: string]: object } = {};

  if (bearer) {
    securitySchemes["ApiBearerAuth"] = {
      type: "http",
      scheme: "bearer",
      bearerFormat: typeof bearer === "object" ? bearer.format : "JWT",
    };
  }

  if (apiKey) {
    securitySchemes["ApiKeyAuth"] = {
      type: "apiKey",
      in: "header",
      name: typeof apiKey === "object" ? apiKey.headerName : "X-API-KEY",
    };
  }

  const swaggerFile = {
    ...base,
    paths: PATHS,
    components: {
      schemas: SCHEMAS,
      securitySchemes,
    },
  }

  await fs.writeFile(swaggerFilePath, JSON.stringify(swaggerFile))

  clearPaths();
  clearSchemas();
}