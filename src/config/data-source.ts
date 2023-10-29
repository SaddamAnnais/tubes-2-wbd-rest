import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entity/User";
import * as dotenv from "dotenv";
import { Recipe } from "../entity/Recipe";
import { Collection } from "../entity/Collection";
import { CollectionRecipe } from "../entity/CollectionRecipe";

dotenv.config();
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: +process.env.POSTGRES_PORT,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  cache: {
    type: "redis",
    duration: +process.env.DEFAULT_EXPIRATION_DURATION,
    options: {
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      },
    },
  },
  synchronize: true,
  logging: false,
  entities: [User, Recipe, Collection, CollectionRecipe],
});
