import { RecipeController } from "../controller/RecipeController";
import { UserController } from "../controller/UserController";

export interface Route {
  method: "post" | "put" | "delete" | "patch" | "put" | "get";
  route: string;
  controller: typeof UserController | typeof RecipeController;
  action: string;
}
