import path from "path"
import { generateSwaggerFile } from "../src"

async function run() {
  await generateSwaggerFile({
    base: {
      info: {
        title: "Example API",
        version: "1.0.0"
      },
      openapi: "3.0.0",
      servers: []
    },
    controllersGlob: path.join(__dirname, "controllers", "**", "*"),
    schemasGlob: path.join(__dirname, "schemas", "**", "*"),
    swaggerFilePath: path.join(__dirname, "swagger.json"),
  })
}

run()