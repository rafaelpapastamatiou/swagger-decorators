import { ApiTags, ApiBody, ApiResponse, ApiParam, ApiQuery, ApiRoute } from "../../src";
import { CreateUserInputDTO, CreateUserOutputDTO } from "../schemas/create-user.dto";

export class UserController {
  @ApiRoute({ method: "post", path: "/users/{name}" })
  @ApiTags("users")
  @ApiBody({ schema: CreateUserInputDTO })
  @ApiResponse({ status: 201, schema: CreateUserOutputDTO })
  @ApiParam({ name: "name", example: "Rafael Papastamatiou" })
  @ApiQuery({ name: "id", example: "abc", type: "string" })
  createUser(req: any, res: any) {
    return new CreateUserOutputDTO("John Doe", "johndoe@email.com")
  }
}