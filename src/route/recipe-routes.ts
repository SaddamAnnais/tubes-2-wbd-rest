import { RecipeController } from "../controller/RecipeController";
import { Route } from "../type/route";

// example of routes

// method: method of the corresponding request. Example : "get", "post"
// route: self explanatory. Example: "/users",
// controller: controller class that manage the corresdonging request. Example: UserController,
// action: the  method's name inside the controller class that manage the corresdonging request.
//         Example: "all" meaning it will call the all method inside the UserController class.

export const RecipeRoutes: Route[] = [
  {
    method: "post",
    route: "/recipe",
    controller: RecipeController,
    action: "create",
  },
];
