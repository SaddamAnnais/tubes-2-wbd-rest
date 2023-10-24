import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { AppDataSource } from "./config/data-source";
import { UserRoutes } from "./route/user-routes";
import { User } from "./entity/User";
import { ServerConfig } from "./config/server-config";
import * as dotenv from "dotenv";

dotenv.config();
console.log("test", process.env.POSTGRES_HOST)

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

    // TO BE DELETED
    // insert new users for test
    await AppDataSource.manager.save(
      AppDataSource.manager.create(User, {
        firstName: "Timber",
        lastName: "Saw",
        age: 27,
      })
    );

    await AppDataSource.manager.save(
      AppDataSource.manager.create(User, {
        firstName: "Phantom",
        lastName: "Assassin",
        age: 24,
      })
    );
    
    // END OF TO BE DELETED

    console.log(
      "Express server has started on port",
      ServerConfig.port,
      "Open http://localhost:" + ServerConfig.port + "/users to see results"
    );
  })
  .catch((error) => console.log(error));
