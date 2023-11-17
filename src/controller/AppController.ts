import { Request, Response } from "express";
import { SoapService } from "../service/SoapService";
import { UserSubs } from "../type/subscription";
import { createResponse } from "../util/create-response";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { AppDataSource } from "../config/data-source";
import { User } from "../entity/User";
import { Collection } from "../entity/Collection";
import { CollecWithCover } from "../type/collection";
import { CollectionRecipe } from "../entity/CollectionRecipe";
import { Recipe } from "../entity/Recipe";
import * as path from "path";

export class AppController {
  private soap = new SoapService();
  private userRepo = AppDataSource.getRepository(User);
  private colleRepo = AppDataSource.getRepository(Collection);
  private colleRecipeRepo = AppDataSource.getRepository(CollectionRecipe);
  private recipeRepo = AppDataSource.getRepository(Recipe);

  async getCreators(req: Request, res: Response) {
    const requesterID = res.locals.requesterID;

    // Get all creators
    const creators = await this.userRepo.find({
      select: { password_hash: false, is_admin: false },
      where: { is_admin: false },
      cache: true,
    });

    // Check typeorm error
    if (!creators) {
      createResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
      return;
    }

    // Generate subs status for each creator
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
    const requesterID = res.locals.requesterID;

    // Check params
    const creatorId = parseInt(req.params.creatorId);

    if (!creatorId || isNaN(creatorId)) {
      createResponse(res, StatusCodes.BAD_REQUEST, "Invalid id parameter.");
      return;
    }

    // Check subs status
    const subsStatus = await this.soap.getStatus(creatorId, requesterID);

    if (subsStatus !== "APPROVED") {
      createResponse(
        res,
        StatusCodes.UNAUTHORIZED,
        "Requester don't have access to pro content."
      );
      return;
    }

    // Get data
    const collections = await this.colleRepo.find({
      where: {
        user_id: creatorId,
      },
      relations: {
        collectionRecipe: {
          recipe: true,
        },
      },
      cache: true,
    });

    // Get creator information
    const creator = await this.userRepo.findOne({
      where: {
        id: creatorId,
      },
    });

    const creator_id: number = creator.id;
    const creator_name: string = creator.name;

    // Check typeorm error
    if (!collections) {
      createResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );

      return;
    }

    // Generate cover
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
        creator_name: collec.user.name,
      });
    });

    const data = {
      collections: collecWithCover,
      creator_id,
      creator_name,
    };

    createResponse(res, StatusCodes.OK, ReasonPhrases.OK, data);
  }

  async getCollection(req: Request, res: Response) {
    const requesterID = res.locals.requesterID;

    // Check params
    const collecId = parseInt(req.params.collecId);

    if (!collecId || isNaN(collecId)) {
      createResponse(res, StatusCodes.BAD_REQUEST, "Invalid id parameter.");

      return;
    }

    // Get data
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

    // Check subs status
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

    // Generate cover
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
      creator_name: collection.user.name,
    };

    createResponse(res, StatusCodes.OK, ReasonPhrases.OK, collecWithCover);
  }

  async getCollectionRecipes(req: Request, res: Response) {
    const requesterID = res.locals.requesterID;

    // Check params
    const collecId = parseInt(req.params.collecId);

    if (!collecId || isNaN(collecId)) {
      createResponse(res, StatusCodes.BAD_REQUEST, "Invalid id parameter.");
      return;
    }

    // Get data
    const collection = await this.colleRepo.findOneBy({ id: collecId });

    if (!collection) {
      createResponse(res, StatusCodes.NOT_FOUND, "Collection not found.");
      return;
    }

    // Check subs status
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

    // Get data
    const recipes = await this.colleRecipeRepo.find({
      where: { collectionId: collecId },
      relations: {
        recipe: true,
      },
    });

    // Check typeorm error
    if (!recipes) {
      createResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
      return;
    }

    // Generate image path
    for (let recipe of recipes) {
      recipe.recipe.image_path = `${process.env.REST_URL}/public/${recipe.recipe.image_path}`;
    }

    createResponse(res, StatusCodes.OK, ReasonPhrases.OK, recipes);
  }

  async getRecipe(req: Request, res: Response) {
    const requesterID = res.locals.requesterID;

    // Check params
    const recipeId = parseInt(req.params.recipeId);

    if (!recipeId || isNaN(recipeId)) {
      createResponse(res, StatusCodes.BAD_REQUEST, "Invalid id parameter.");
      return;
    }

    // Get data
    const recipe = await this.recipeRepo.findOne({
      select: {
        video_path: false,
      },
      where: {
        id: recipeId,
      },
    });

    if (!recipe) {
      createResponse(res, StatusCodes.NOT_FOUND, "Recipe not found.");
      return;
    }

    // Check subs status
    const subsStatus = await this.soap.getStatus(recipe.user_id, requesterID);

    if (subsStatus !== "APPROVED") {
      createResponse(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
      return;
    }

    // Generate image path
    recipe.image_path = `${process.env.REST_URL}/public/${recipe.image_path}`;

    createResponse(res, StatusCodes.OK, ReasonPhrases.OK, recipe);
  }

  async getRecipeVideo(req: Request, res: Response) {
    const requesterID = res.locals.requesterID;

    // Check params
    const recipeId = parseInt(req.params.recipeId);

    if (!recipeId || isNaN(recipeId)) {
      createResponse(res, StatusCodes.BAD_REQUEST, "Invalid id parameter.");
      return;
    }

    // Get data
    const recipe = await this.recipeRepo.findOne({
      select: {
        video_path: true,
        user_id: true,
      },
      where: {
        id: recipeId,
      },
    });

    if (!recipe) {
      createResponse(res, StatusCodes.NOT_FOUND, "Recipe not found.");
      return;
    }

    // Check subs status
    const subsStatus = await this.soap.getStatus(recipe.user_id, requesterID);

    if (subsStatus !== "APPROVED") {
      createResponse(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
      return;
    }

    // Send file
    res.sendFile(
      path.join(__dirname, "..", "..", "storage", "videos", recipe.video_path)
    );
  }

  async getRecipesByCreator(req: Request, res: Response) {
    const requesterID = res.locals.requesterID;

    // Check params
    const creatorId = parseInt(req.params.creatorId);
    if (!creatorId || isNaN(creatorId)) {
      createResponse(res, StatusCodes.BAD_REQUEST, "Invalid id parameter.");
      return;
    }

    // Check subs status
    const subsStatus = await this.soap.getStatus(creatorId, requesterID);

    if (subsStatus !== "APPROVED") {
      createResponse(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
      return;
    }

    // Get data
    const recipes = await this.recipeRepo.find({
      select: {
        video_path: false,
      },
      where: {
        user_id: creatorId,
      },
    });

    // Check typeorm error
    if (!recipes) {
      createResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
      return;
    }

    // Generate image path
    for (let recipe of recipes) {
      recipe.image_path = `${process.env.REST_URL}/public/${recipe.image_path}`;
    }

    createResponse(res, StatusCodes.OK, ReasonPhrases.OK, recipes);
  }
}
