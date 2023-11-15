import { CollectionController } from "../controller/CollectionController";
import { RecipeController } from "../controller/RecipeController";
import { SoapController } from "../controller/SoapController";
import { UserController } from "../controller/UserController";
import { RequestHandler } from "express";

export interface Route {
  method: "post" | "put" | "delete" | "patch" | "put" | "get";
  route: string;
  middleware?: RequestHandler<{}, any, any, Record<string, any>>[];
  controller:
    | typeof UserController
    | typeof RecipeController
    | typeof CollectionController
    | typeof SoapController;
  action: string;
}
