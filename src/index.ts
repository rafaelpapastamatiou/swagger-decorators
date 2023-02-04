import "reflect-metadata"
import glob from "glob-promise"
import fs from "fs/promises"

import { PATHS } from "./data/paths";
import { SCHEMAS } from "./data/schemas";

export { ApiPath } from "./decorators/path.decorator"
export { ApiSchema, ApiSchemaProperty } from "./decorators/schema.decorator"
export { formatSwaggerRef } from "./utils/format-swagger-ref"

interface GenerateSwaggerFileProps {
  controllersGlob: string;
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
  base,
  swaggerFilePath,
}: GenerateSwaggerFileProps) {
  const files = await glob.promise(controllersGlob)

  for (const file of files) {
    await import(file)
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