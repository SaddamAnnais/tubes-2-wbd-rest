import { AppDataSource } from "../config/data-source";
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { RegisterRequest } from "../type/user";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { genSalt, hash } from "bcrypt";
import { AuthToken } from "../type/auth";
import { JwtAccessConfig } from "../config/jwt-config";
import jwt from "jsonwebtoken";

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  async register(req: Request, res: Response, next: NextFunction) {
    const { email, username, name, password }: RegisterRequest = req.body;

    // if input is invalid
    if (!email || !username || !name || !password) {
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

    // if email already exists
    const emailExist = await this.userRepository.findOne({
      select: { email: true },
      where: { email },
    });

    if (emailExist) {
      res.status(StatusCodes.CONFLICT).json({
        message: "Email already taken",
      });
      return;
    }

    // hash the password
    const salt = await genSalt(10);
    const hashPassword = await hash(password, salt);

    // making the user class
    const user = new User();
    user.username = username;
    user.email = email;
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

    const { id, is_admin } = savedUser;
    const payload: AuthToken = {
      id: id,
      isAdmin: is_admin,
    };

    const accessToken = jwt.sign(payload, JwtAccessConfig.secret, {
      expiresIn: JwtAccessConfig.expiresIn,
    });

    res.status(StatusCodes.CREATED).json({
      message: ReasonPhrases.CREATED,
    });
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

  async save(request: Request, response: Response, next: NextFunction) {
    const { firstName, lastName, age } = request.body;

    const user = Object.assign(new User(), {
      firstName,
      lastName,
      age,
    });

    return this.userRepository.save(user);
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
