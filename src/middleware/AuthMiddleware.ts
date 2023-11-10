import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthToken } from "../type/auth";

export class AuthMiddleware {
  async authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // if token is not set
    if (token == null) return res.sendStatus(401);

    try {
      jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
      const payload: AuthToken = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );
      res.locals.id = payload.id;
      res.locals.isAdmin = payload.isAdmin;
      next();
    } catch (err) {
      res.clearCookie("token");
      // res.redirect("/login");
    }
  }
}
