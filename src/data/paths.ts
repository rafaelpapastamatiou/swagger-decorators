import { SchemaRef } from "./schemas";

export const PATHS: Paths = {};

export type Param = {
  in: "path" | "query" | "header" | "cookie";
  name: string;
  schema?: SchemaRef;
  required?: boolean;
};

export interface Response {
  responseSchema?: string;
  responseMessage?: string;
  description: string;
  content?: {
    [type: string]: {
      schema?: SchemaRef;
    };
  };
}

export interface Responses {
  [status: number]: Response;
}

export interface Path {
  [method: string]: {
    description?: string;
    parameters?: Param[];
    responses?: Responses;
    requestBody?: RequestBody;
  };
};

export interface RequestBody {
  description?: string;
  required?: boolean;
  content: {
    [format: string]: {
      schema?: SchemaRef;
    }
  }
}

export interface Paths {
  [path: string]: Path;
}