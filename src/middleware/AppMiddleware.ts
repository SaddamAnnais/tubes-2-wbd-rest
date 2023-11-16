import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthToken } from "../type/auth";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { createResponse } from "../util/create-response";

export class AppMiddleware {
  async authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["X-API-KEY"];
    const token = authHeader;

    if (!token || token !== process.env.APP_KEY) {
      createResponse(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
      return;
    }

    next();
  }
}
