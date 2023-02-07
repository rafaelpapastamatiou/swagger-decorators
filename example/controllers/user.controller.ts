import { ApiPath } from "../../src";
import { CreateUserOutputDTO } from "../schemas/create-user.dto";

export class UserController {
  @ApiPath({
    method: "post",
    description: "Creates a new user",
    path: "/users",
    requestBodySchema: "CreateUserInputDTO",
    responses: {
      200: {
        description: "User created",
        responseSchema: "CreateUserOutputDTO"
      }
    }
  })
  createUser(req: any, res: any) {
    return new CreateUserOutputDTO("John Doe", "johndoe@email.com")
  }
}