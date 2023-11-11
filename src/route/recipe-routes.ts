import { NextFunction, Request, Response } from "express";
import { RecipeController } from "../controller/RecipeController";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import { FileMiddleware } from "../middleware/FileMiddleware";
import { Route } from "../type/route";

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
  {
    method: "put",
    route: "/recipe/:id",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        authMiddleware.authenticate(req, res, next),
      FileMiddleware.upload_video_image(),
    ],
    controller: RecipeController,
    action: "update",
  },
  {
    method: "delete",
    route: "/recipe/:id",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        authMiddleware.authenticate(req, res, next),
      FileMiddleware.upload_video_image(),
    ],
    controller: RecipeController,
    action: "delete",
  },
  {
    method: "get",
    route: "/recipe",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        authMiddleware.authenticate(req, res, next),
    ],
    controller: RecipeController,
    action: "getAll",
  },
  {
    method: "get",
    route: "/recipe/video/:id",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        authMiddleware.authenticate(req, res, next),
    ],
    controller: RecipeController,
    action: "getVideo",
  },
  {
    method: "get",
    route: "/recipe/details/:id",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        authMiddleware.authenticate(req, res, next),
    ],
    controller: RecipeController,
    action: "getDetails",
  },
];
