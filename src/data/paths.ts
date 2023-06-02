import { SchemaRef } from "./schemas";

export const PATHS: Paths = {};
export const CONTROLLERS: Controllers = {};

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