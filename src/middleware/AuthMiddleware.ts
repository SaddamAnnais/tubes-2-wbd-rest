import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthToken } from "../type/auth";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { createResponse } from "../util/create-response";

export class AuthMiddleware {
  async authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // if token is not set
    if (!token) {
      createResponse(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
      return;
    }

    try {
      jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
      const payload: AuthToken = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );

      // check if user still exist
      const userRepo = AppDataSource.getRepository(User);
      const userData = await userRepo.findOneBy({
        id: payload.id,
      });

      if (!userData) {
        createResponse(
          res,
          StatusCodes.UNAUTHORIZED,
          ReasonPhrases.UNAUTHORIZED
        );
        return;
      }

      res.locals.id = payload.id;
      res.locals.isAdmin = payload.isAdmin;
      next();
    } catch (err) {
      res.clearCookie("token");
      createResponse(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
      return;
    }
  }
}
