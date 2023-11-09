import { AppDataSource } from "../config/data-source";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { LoginRequest, RegisterRequest } from "../type/user";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import { AuthToken } from "../type/auth";
import { JwtAccessConfig } from "../config/jwt-config";
import jwt from "jsonwebtoken";

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  async register(req: Request, res: Response, next: NextFunction) {
    const { username, name, password }: RegisterRequest = req.body;

    // if input is invalid
    if (!username || !name || !password) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
      });
      return;
    }

    // if username already exists
    const usernameExist = await this.userRepository.findOne({
      select: { username: true },
      where: { username },
    });

    if (usernameExist) {
      res.status(StatusCodes.CONFLICT).json({
        message: "Username already taken",
      });
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
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      });
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
    res.status(StatusCodes.CREATED).json({
      message: ReasonPhrases.CREATED,
      token: accessToken, // delete if cookie works
    });
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const { username, password }: LoginRequest = req.body;

    // if input is invalid
    if (!username || !password) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
      });
      return;
    }

    // find the user inside database
    const user = await this.userRepository.findOne({
      select: { id: true, password_hash: true, is_admin: true },
      where: { username: username },
    });

    // if user not found
    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: ReasonPhrases.UNAUTHORIZED,
      });
      return;
    }

    // if password is incorrect
    const isCorrect = await bcrypt.compare(password, user.password_hash);
    if (!isCorrect) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: ReasonPhrases.UNAUTHORIZED,
      });
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

    // set status and message
    res.status(StatusCodes.CREATED).json({
      message: ReasonPhrases.CREATED,
      token: accessToken, // delete if cookie works
    });

    // set token as cookie
    res.cookie("token", accessToken, { httpOnly: true });
  }

  async all(request: Request, response: Response, next: NextFunction) {
    // cache: {id: string, milliseconds: 2000}
    // this will use the custom key and duration provided in the request
    return this.userRepository.find({
      cache: { id: "/users", milliseconds: 120000 },
    });
  }

  async one(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);

    const user = await this.userRepository.findOne({
      // cache: true
      // this will use the default duration time defined in data-source
      // the key will be the sql query made by type orm
      where: { id },
      cache: true,
    });

    if (!user) {
      return "unregistered user";
    }
    return user;
  }

  async remove(request: Request, response: Response, next: NextFunction) {
    const id = parseInt(request.params.id);

    let userToRemove = await this.userRepository.findOneBy({ id });

    if (!userToRemove) {
      return "this user not exist";
    }

    await this.userRepository.remove(userToRemove);

    return "user has been removed";
  }
}
