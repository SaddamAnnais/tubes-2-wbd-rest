import { NextFunction, Request, Response } from "express";
import { AppController } from "../controller/AppController";
import { AppMiddleware } from "../middleware/AppMiddleware";
import { Route } from "../type/route";

const appMiddleware = new AppMiddleware();

export const CollectionRoutes: Route[] = [
  {
    method: "get",
    route: "/pro/creator",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        appMiddleware.authenticate(req, res, next),
    ],
    controller: AppController,
    action: "getCreators",
  },
  {
    method: "get",
    route: "/pro/creator/:creatorId/collection", // data only
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        appMiddleware.authenticate(req, res, next),
    ],
    controller: AppController,
    action: "getCollectionsByCreator",
  },
  {
    method: "get",
    route: "/pro/collection/:collecId",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        appMiddleware.authenticate(req, res, next),
    ],
    controller: AppController,
    action: "getCollection",
  },
  {
    method: "get",
    route: "/pro/collection/:collecId/recipes",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        appMiddleware.authenticate(req, res, next),
    ],
    controller: AppController,
    action: "getCollectionRecipes",
  },
  {
    method: "get",
    route: "/pro/recipe/:recipeId",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        appMiddleware.authenticate(req, res, next),
    ],
    controller: AppController,
    action: "getRecipe",
  },
  {
    method: "get",
    route: "/pro/recipe/:recipeId/video",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        appMiddleware.authenticate(req, res, next),
    ],
    controller: AppController,
    action: "getRecipeVideo",
  },
  {
    method: "get",
    route: "/pro/creator/:creatorId/recipes",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        appMiddleware.authenticate(req, res, next),
    ],
    controller: AppController,
    action: "getRecipesByCreator",
  },
];
