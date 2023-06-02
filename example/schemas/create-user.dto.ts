import { ApiSchema, ApiSchemaProperty } from "../../src"

export class MoreInfo {
  @ApiSchemaProperty()
  email: string;
}

export class NestedObject {
  @ApiSchemaProperty({
    type: MoreInfo
  })
  moreInfo: MoreInfo[];
}

export class ArrayItem {
  @ApiSchemaProperty()
  name: string;

  @ApiSchemaProperty()
  obj: NestedObject;
}

@ApiSchema()
export class CreateUserInputDTO {
  @ApiSchemaProperty({
    type: ArrayItem
  })
  arr: ArrayItem[];
}

@ApiSchema()
export class CreateUserOutputDTO {
  @ApiSchemaProperty({
    required: true,
    example: "John Doe"
  })
  name: string;

  @ApiSchemaProperty({
    required: true,
    example: "johndoe@email.com"
  })
  email: string;

  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }
}