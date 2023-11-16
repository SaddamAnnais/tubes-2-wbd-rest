import * as dotenv from "dotenv";

dotenv.config();
export const PHPConfig: { key: string } = {
  key: process.env.APP_KEY,
};