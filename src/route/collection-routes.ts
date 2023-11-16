import { NextFunction, Request, Response } from "express";
import { CollectionController } from "../controller/CollectionController";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import { Route } from "../type/route";

const authMiddleware = new AuthMiddleware();

export const CollectionRoutes: Route[] = [
  {
    method: "get",
    route: "/collection",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        authMiddleware.authenticate(req, res, next),
    ],
    controller: CollectionController,
    action: "getAll",
  },
  {
    method: "get",
    route: "/collection/:id",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        authMiddleware.authenticate(req, res, next),
    ],
    controller: CollectionController,
    action: "get",
  },
  {
    method: "get",
    route: "/collection/:id/recipes",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        authMiddleware.authenticate(req, res, next),
    ],
    controller: CollectionController,
    action: "getRecipes",
  },
  {
    method: "post",
    route: "/collection",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        authMiddleware.authenticate(req, res, next),
    ],
    controller: CollectionController,
    action: "create",
  },
  {
    method: "delete",
    route: "/collection/:id",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        authMiddleware.authenticate(req, res, next),
    ],
    controller: CollectionController,
    action: "delete",
  },
  {
    method: "put",
    route: "/collection/:id",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        authMiddleware.authenticate(req, res, next),
    ],
    controller: CollectionController,
    action: "update",
  },
  {
    method: "post",
    route: "/collection/:id",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        authMiddleware.authenticate(req, res, next),
    ],
    controller: CollectionController,
    action: "addRecipe",
  },
  {
    method: "post",
    route: "/collection/:id",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        authMiddleware.authenticate(req, res, next),
    ],
    controller: CollectionController,
    action: "removeRecipe",
  },
];
