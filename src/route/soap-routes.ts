import { NextFunction, Request, Response } from "express";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import { Route } from "../type/route";
import { SoapController } from "../controller/SoapController";

const authMiddleware = new AuthMiddleware();

export const SoapRoutes: Route[] = [
  {
    method: "get",
    route: "/subscription",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        authMiddleware.authenticate(req, res, next),
    ],
    controller: SoapController,
    action: "getAll",
  },
  {
    method: "post",
    route: "/subscription/reject",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        authMiddleware.authenticate(req, res, next),
    ],
    controller: SoapController,
    action: "reject",
  },
  {
    method: "post",
    route: "/subscription/approve",
    middleware: [
      (req: Request, res: Response, next: NextFunction) =>
        authMiddleware.authenticate(req, res, next),
    ],
    controller: SoapController,
    action: "approve",
  },
];
