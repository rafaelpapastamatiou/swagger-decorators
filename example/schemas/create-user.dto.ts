import { ApiSchema, ApiSchemaProperty } from "../../src"

@ApiSchema()
export class CreateUserInputDTO {
  @ApiSchemaProperty({
    required: true,
    example: "John"
  })
  firstName: string;

  @ApiSchemaProperty({
    required: true,
    example: "Doe"
  })
  lastName: string;

  @ApiSchemaProperty({
    required: true,
    example: "johndoe@email.com"
  })
  email: string;

  @ApiSchemaProperty({
    required: true,
    example: "123456"
  })
  password: string;
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

  constructor( name: string,  email: string){
    this.name = name;
    this.email = email;
  }
}