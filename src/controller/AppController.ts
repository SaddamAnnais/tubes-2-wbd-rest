import { Request, Response } from "express";
import { SoapService } from "./SoapService";
import { ProRequest, UserSubs } from "../type/subscription";
import { createResponse } from "../util/create-response";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { Collection } from "../entity/Collection";
import { CollecWithCover } from "../type/collection";
import { CollectionRecipe } from "../entity/CollectionRecipe";
import { Recipe } from "../entity/Recipe";

export class AppController {
  private soap = new SoapService();
  private userRepo = AppDataSource.getRepository(User);
  private colleRepo = AppDataSource.getRepository(Collection);
  private colleRecipeRepo = AppDataSource.getRepository(CollectionRecipe);
  private recipeRepo = AppDataSource.getRepository(Recipe);

  async getCreators(req: Request, res: Response) {
    const { requesterID }: ProRequest = req.body;

    if (!requesterID) {
      createResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Field requesterID cannot be empty."
      );

      return;
    }

    const creators = await this.userRepo.find({
      select: { password_hash: false, is_admin: false },
      where: { is_admin: false },
    });

    if (!creators) {
      createResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );

      return;
    }

    const creatorSubs: UserSubs[] = [];
    for (const el of creators) {
      const subsStatus = await this.soap.getStatus(el.id, requesterID);
      creatorSubs.push({
        id: el.id,
        username: el.username,
        name: el.name,
        subsStatus,
      });
    }

    createResponse(res, StatusCodes.OK, ReasonPhrases.OK, creatorSubs);
  }

  async getCollectionsByCreator(req: Request, res: Response) {
    const creatorId = +req.params.creatorId;

    if (!creatorId || isNaN(creatorId)) {
      createResponse(res, StatusCodes.BAD_REQUEST, "Invalid id parameter.");

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

    const subsStatus = await this.soap.getStatus(creatorId, requesterID);

    if (subsStatus !== "APPROVED") {
      createResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        "Requester don't have access to pro content."
      );

      return;
    }

    const collections = await this.colleRepo.find({
      where: {
        user_id: creatorId,
      },
      relations: {
        collectionRecipe: {
          recipe: true,
        },
      },
    });

    if (!collections) {
      createResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
    }

    let collecWithCover: CollecWithCover[] = [];
    collections.forEach((collec) => {
      collecWithCover.push({
        id: collec.id,
        title: collec.title,
        created_at: collec.created_at,
        total_recipe: collec.total_recipe,
        cover: `${process.env.REST_URL}/public/${
          collec.collectionRecipe[0]
            ? collec.collectionRecipe[0].recipe.image_path
            : "default-pro-cover.png"
        }`,
        user_id: collec.user_id,
      });
    });

    createResponse(res, StatusCodes.OK, ReasonPhrases.OK, collecWithCover);
  }

  async getCollection(req: Request, res: Response) {
    const collecId = +req.params.collecId;

    if (!collecId || isNaN(collecId)) {
      createResponse(res, StatusCodes.BAD_REQUEST, "Invalid id parameter.");

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

    const collection = await this.colleRepo.findOne({
      where: {
        id: collecId,
      },
      relations: {
        collectionRecipe: {
          recipe: true,
        },
      },
    });

    if (!collection) {
      createResponse(res, StatusCodes.NOT_FOUND, "Collection not found.");
      return;
    }

    const subsStatus = await this.soap.getStatus(
      collection.user_id,
      requesterID
    );

    if (subsStatus !== "APPROVED") {
      createResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        "Requester don't have access to pro content."
      );

      return;
    }

    const collecWithCover: CollecWithCover = {
      id: collection.id,
      title: collection.title,
      created_at: collection.created_at,
      total_recipe: collection.total_recipe,
      cover: `${process.env.REST_URL}/public/${
        collection.collectionRecipe[0]
          ? collection.collectionRecipe[0].recipe.image_path
          : "default-pro-cover.png"
      }`,
      user_id: collection.user_id,
    };

    createResponse(res, StatusCodes.OK, ReasonPhrases.OK, collecWithCover);
  }

  async getCollectionRecipes(req: Request, res: Response) {
    const collecId = parseInt(req.params.collecId);

    if (!collecId || isNaN(collecId)) {
      createResponse(res, StatusCodes.BAD_REQUEST, "Invalid id parameter.");
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

    const collection = await this.colleRepo.findOneBy({ id: collecId });

    // validate collection
    if (!collection) {
      createResponse(res, StatusCodes.NOT_FOUND, "Collection not found.");
      return;
    }

    // validate owner
    const subsStatus = await this.soap.getStatus(
      collection.user_id,
      requesterID
    );
    if (subsStatus !== "APPROVED") {
      createResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        "Requester don't have access to pro content."
      );
      return;
    }

    const recipes = await this.colleRecipeRepo.find({
      where: { collectionId: collecId },
      relations: {
        recipe: true,
      },
    });

    if (!recipes) {
      createResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
      return;
    }

    for (let recipe of recipes) {
      recipe.recipe.image_path = `${process.env.REST_URL}/public/${recipe.recipe.image_path}`;
    }

    createResponse(res, StatusCodes.OK, ReasonPhrases.OK, recipes);
  }

  async getRecipe(req: Request, res: Response) {
    const user_id = res.locals.id;
    const id = parseInt(req.params.id);

    if (!id || isNaN(id)) {
      createResponse(res, StatusCodes.BAD_REQUEST, "Invalid id parameter.");
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

    const recipe = await this.recipeRepo.findOne({
      select: {
        video_path: false, // serve image as static file (publicly available)
      },
      where: {
        id: id,
      },
    });

    if (!recipe) {
      createResponse(res, StatusCodes.NOT_FOUND, "Recipe not found.");
      return;
    }

    const subsStatus = await this.soap.getStatus(recipe.user_id, requesterID);
    if (subsStatus !== "APPROVED") {
      createResponse(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
      return;
    }

    recipe.image_path = `${process.env.REST_URL}/public/${recipe.image_path}`;

    createResponse(res, StatusCodes.OK, ReasonPhrases.OK, recipe);
  }

  async getRecipeVideo(req: Request, res: Response) {}

  async getRecipesByCreator(req: Request, res: Response) {}
}
