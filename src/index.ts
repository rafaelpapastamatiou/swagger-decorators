import "reflect-metadata"
import glob from "glob-promise"
import fs from "fs/promises"

import { PATHS } from "./data/paths";
import { SCHEMAS, clearLoadedClasses } from "./data/schemas";

export { ApiPath } from "./decorators/path.decorator"
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
  }
}

export async function generateSwaggerFile({
  controllersGlob,
  schemasGlob,
  base,
  swaggerFilePath,
}: GenerateSwaggerFileProps) {
  const [schemas, controllers] = await Promise.all([
    glob.promise(schemasGlob),
    glob.promise(controllersGlob),
  ])

  for (const schema of schemas) {
    await import(schema)
    clearLoadedClasses();
  }

  for (const controller of controllers) {
    await import(controller)
  }

  const swaggerFile = {
    ...base,
    paths: PATHS,
    components: {
      schemas: SCHEMAS,
    },
  }

  await fs.writeFile(swaggerFilePath, JSON.stringify(swaggerFile))
}