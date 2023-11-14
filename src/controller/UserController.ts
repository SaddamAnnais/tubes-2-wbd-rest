import { AppDataSource } from "../config/data-source";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { LoginRequest, RegisterRequest } from "../type/user";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import { AuthToken } from "../type/auth";
import { JwtAccessConfig } from "../config/jwt-config";
import jwt from "jsonwebtoken";
import { createResponse } from "../util/create-response";

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  async register(req: Request, res: Response, next: NextFunction) {
    const { username, name, password }: RegisterRequest = req.body;

    // if input is invalid
    if (!username || !name || !password) {
      createResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Field username, name, and password cannot be empty."
      );
      return;
    }

    // if username already exists
    const usernameExist = await this.userRepository.findOne({
      select: { username: true },
      where: { username },
    });

    if (usernameExist) {
      createResponse(res, StatusCodes.CONFLICT, "Username already taken.");
      return;
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // making the user class
    const user = new User();
    user.username = username;
    user.name = name;
    user.password_hash = hashPassword;
    user.is_admin = false;

    // saving into database
    const savedUser = await this.userRepository.save(user);

    // if failed to save the user
    if (!savedUser) {
      createResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
      return;
    }

    // constructing the payload for jwt token
    const payload: AuthToken = {
      id: savedUser.id,
      isAdmin: savedUser.is_admin,
    };

    const accessToken = jwt.sign(payload, JwtAccessConfig.secret, {
      expiresIn: JwtAccessConfig.expiresIn,
    });

    // set token as cookie
    res.cookie("token", accessToken, { httpOnly: true });

    // set status and message
    createResponse(res, StatusCodes.CREATED, ReasonPhrases.CREATED, {
      token: accessToken,
    });
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const { username, password }: LoginRequest = req.body;

    // if input is invalid
    if (!username || !password) {
      createResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Field username and password cannot be empty."
      );
      return;
    }

    // find the user inside database
    const user = await this.userRepository.findOne({
      select: { id: true, password_hash: true, is_admin: true },
      where: { username: username },
    });

    // if user not found
    if (!user) {
      createResponse(res, StatusCodes.UNAUTHORIZED, "Username not found.");
      return;
    }

    // if password is incorrect
    const isCorrect = await bcrypt.compare(password, user.password_hash);
    if (!isCorrect) {
      createResponse(res, StatusCodes.UNAUTHORIZED, "Invalid credentials.");
      return;
    }

    // constructing the payload for jwt token
    const payload: AuthToken = {
      id: user.id,
      isAdmin: user.is_admin,
    };

    const accessToken = jwt.sign(payload, JwtAccessConfig.secret, {
      expiresIn: JwtAccessConfig.expiresIn,
    });

    // set token as cookie
    res.cookie("token", accessToken, { httpOnly: true });

    // set status and message
    createResponse(res, StatusCodes.CREATED, ReasonPhrases.CREATED, {
      token: accessToken,
    });
  }

  async all(request: Request, response: Response, next: NextFunction) {
    // cache: {id: string, milliseconds: 2000}
    // this will use the custom key and duration provided in the request
    const users = this.userRepository.find({
      cache: { id: "/users", milliseconds: 120000 },
    });

    if (!users) {
      createResponse(
        response,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
      return;
    }

    createResponse(response, StatusCodes.CREATED, ReasonPhrases.CREATED, users);
  }

  async one(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);

    if (!id || isNaN(id)) {
      createResponse(
        response,
        StatusCodes.BAD_REQUEST,
        "Invalid id parameter."
      );
      return;
    }

    const user = await this.userRepository.findOne({
      // cache: true
      // this will use the default duration time defined in data-source
      // the key will be the sql query made by type orm
      where: { id },
      cache: true,
    });

    if (!user) {
      createResponse(response, StatusCodes.NOT_FOUND, "User not found.");
      return;
    }

    createResponse(response, StatusCodes.OK, ReasonPhrases.OK, user);
  }

  async remove(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);
    if (!id || isNaN(id)) {
      createResponse(
        response,
        StatusCodes.BAD_REQUEST,
        "Invalid id parameter."
      );
      return;
    }

    let userToRemove = await this.userRepository.findOneBy({ id });

    if (!userToRemove) {
      createResponse(response, StatusCodes.NOT_FOUND, "User not found.");
      return;
    }

    const deleted = await this.userRepository.remove(userToRemove);
    if (!deleted) {
      createResponse(
        response,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
      return;
    }

    createResponse(response, StatusCodes.OK, "User has been removed.");
  }

  async self(request: Request, response: Response, next: NextFunction) {
    const id = response.locals.id;

    const user = await this.userRepository.findOne({
      where: { id },
      cache: true,
    });

    if (!user) {
      createResponse(response, StatusCodes.NOT_FOUND, "User not found.");
      return;
    }

    const userData = {
      id: user.id,
      username: user.username,
      name: user.name,
    };

    createResponse(response, StatusCodes.OK, ReasonPhrases.OK, userData);
  }
}
