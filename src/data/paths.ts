import { SchemaRef } from "./schemas";

export let PATHS: Paths = {};
export let CONTROLLERS: Controllers = {};

export function clearPaths() {
  PATHS = {};
  CONTROLLERS = {};
}

export type Controllers = {
  [controller: string]: Controller;
};

export type Controller = {
  [method: string]: PathOptions;
};

export type Param = {
  in: "path" | "query" | "header" | "cookie";
  name: string;
  schema?: SchemaRef;
  required?: boolean;
  description?: string;
};

export interface Response {
  schema?: string | Function;
  message?: string;
  description?: string;
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
  [method: string]: PathOptions;
};

export interface PathOptions {
  description?: string;
  tags?: string[];
  parameters?: Param[];
  responses?: Responses;
  requestBody?: RequestBody;
  security?: Security[];
}

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

export interface Security {
  [security: string]: [];
}