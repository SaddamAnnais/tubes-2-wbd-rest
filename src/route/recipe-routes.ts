import { NextFunction, Request, Response } from "express";
import { RecipeController } from "../controller/RecipeController";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import { FileMiddleware } from "../middleware/FileMiddleware";
import { Route } from "../type/route";

// example of routes

// method: method of the corresponding request. Example : "get", "post"
// route: self explanatory. Example: "/users",
// controller: controller class that manage the corresdonging request. Example: UserController,
// action: the  method's name inside the controller class that manage the corresdonging request.
//         Example: "all" meaning it will call the all method inside the UserController class.
const authMiddleware = new AuthMiddleware();

export const RecipeRoutes: Route[] = [
  {
    method: "post",
    route: "/recipe",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        authMiddleware.authenticate(req, res, next),
      FileMiddleware.upload_video_image(),
    ],
    controller: RecipeController,
    action: "create",
  },
];
