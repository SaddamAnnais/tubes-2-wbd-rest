import { NextFunction, Request, Response } from "express";
import { UserController } from "../controller/UserController";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import { Route } from "../type/route";

// example of routes

// method: method of the corresponding request. Example : "get", "post"
// route: self explanatory. Example: "/users",
// controller: controller class that manage the corresdonging request. Example: UserController,
// action: the  method's name inside the controller class that manage the corresdonging request.
//         Example: "all" meaning it will call the all method inside the UserController class.

export const UserRoutes: Route[] = [
  {
    method: "post",
    route: "/register",
    controller: UserController,
    action: "register",
  },
  {
    method: "get",
    route: "/users/:id",
    controller: UserController,
    action: "one",
  },
  {
    method: "post",
    route: "/login",
    controller: UserController,
    action: "login",
  },
  {
    method: "get",
    route: "/self",
    middleware: [
      (req: Request, res: Response, next: NextFunction) => {
        new AuthMiddleware().authenticate(req, res, next);
      },
    ],
    controller: UserController,
    action: "self",
  },
];
