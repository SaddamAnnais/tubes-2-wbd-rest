import express from "express";
import bodyParser from "body-parser";
import { Request, Response } from "express";
import { AppDataSource } from "./config/data-source";
import { UserRoutes } from "./route/user-routes";
import "reflect-metadata";
import { ServerConfig } from "./config/server-config";

AppDataSource.initialize()
  .then(async () => {
    // create express app
    const app = express();
    app.use(bodyParser.json());

    // register express routes from defined application routes
    // const Routes = UserRoutes.concat(RecipeRoute, Route2, Route3 ....)
    const Routes = UserRoutes;
    Routes.forEach((route) => {
      (app as any)[route.method](
        route.route,
        (req: Request, res: Response, next: Function) => {
          const result = new (route.controller as any)()[route.action](
            req,
            res,
            next
          );
          if (result instanceof Promise) {
            result.then((result) =>
              result !== null && result !== undefined
                ? res.send(result)
                : undefined
            );
          } else if (result !== null && result !== undefined) {
            res.json(result);
          }
        }
      );
    });

    // start express server
    app.listen(ServerConfig.port);

    console.log(
      "Express server has started on port",
      ServerConfig.port,
      "Open http://localhost:" + ServerConfig.port + "/users to see results"
    );
  })
  .catch((error) => console.log(error));
