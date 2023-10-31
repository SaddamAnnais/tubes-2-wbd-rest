import { Secret } from "jsonwebtoken";

export const JwtAccessConfig: { secret: Secret; expiresIn: string } = {
  secret: process.env.SECRET_ACCESS_TOKEN,
  expiresIn: process.env.SECRET_ACCESS_EXPIRES,
};