import * as dotenv from "dotenv";

dotenv.config();
export const ServerConfig: { port: number } = {
  port: +process.env.REST_API_PORT,
};
