import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthToken } from "../type/auth";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { createResponse } from "../util/create-response";
import { ProRequest } from "../type/subscription";
import { PHPConfig } from "../config/php-config";
export class AppMiddleware {
  async authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["x-api-key"];
    const token = authHeader;

    if (!token || token !== PHPConfig.key) {
      createResponse(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
      return;
    }

    const { requesterID }: ProRequest = req.body;

    if (!requesterID) {
      createResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Field requesterID cannot be empty."
      );
      return;
    }

    res.locals.requesterID = requesterID;
    next();
  }
}
