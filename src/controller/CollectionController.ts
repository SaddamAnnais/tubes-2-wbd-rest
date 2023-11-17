import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Collection } from "../entity/Collection";
import { CollectionRecipe } from "../entity/CollectionRecipe";
import {
  CreateRequest,
  UpdateRequest,
  AddRecipeRequest,
  CollecWithCover,
} from "../type/collection";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { Recipe } from "../entity/Recipe";
import { createResponse } from "../util/create-response";

export class CollectionController {
  private colleRepo = AppDataSource.getRepository(Collection);
  private colleRecipeRepo = AppDataSource.getRepository(CollectionRecipe);
  private recipeRepo = AppDataSource.getRepository(Recipe);

  async getAll(req: Request, res: Response) {
    const user_id = res.locals.id;
    const collections = await this.colleRepo.find({
      where: {
        user_id: user_id,
      },
      relations: {
        user: true,
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
      return;
    }

    let collecWithCover: CollecWithCover[] = [];
    collections.forEach((collec) => {
      collecWithCover.push({
        id: collec.id,
        title: collec.title,
        created_at: collec.created_at,
        total_recipe: collec.total_recipe,
        cover: `http://localhost:3000/public/${
          collec.collectionRecipe[0]
            ? collec.collectionRecipe[0].recipe.image_path
            : "default-pro-cover.png"
        }`,
        user_id: collec.user_id,
        creator_name: collec.user.name,
      });
    });

    createResponse(res, StatusCodes.OK, ReasonPhrases.OK, collecWithCover);
  }

  async get(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const userId = res.locals.id;

    if (!id || isNaN(id)) {
      createResponse(res, StatusCodes.BAD_REQUEST, "Invalid id parameter.");
      return;
    }

    const collection = await this.colleRepo.findOne({
      where: {
        id: id,
      },
      relations: {
        user: true,
        collectionRecipe: {
          recipe: true,
        },
      },
    });

    // validate collection
    if (!collection) {
      createResponse(res, StatusCodes.NOT_FOUND, "Collection not found.");
      return;
    }

    // validate owner
    if (collection.user_id !== userId) {
      createResponse(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
      return;
    }

    const collecWithCover: CollecWithCover = {
      id: collection.id,
      title: collection.title,
      created_at: collection.created_at,
      total_recipe: collection.total_recipe,
      cover: `http://localhost:3000/public/${
        collection.collectionRecipe[0]
          ? collection.collectionRecipe[0].recipe.image_path
          : "default-pro-cover.png"
      }`,
      user_id: collection.user_id,
      creator_name: collection.user.name,
    };

    createResponse(res, StatusCodes.OK, ReasonPhrases.OK, collecWithCover);
  }

  async getRecipes(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const userId = res.locals.id;

    if (!id || isNaN(id)) {
      createResponse(res, StatusCodes.BAD_REQUEST, "Invalid id parameter.");
      return;
    }

    const collection = await this.colleRepo.findOneBy({ id: id });

    // validate collection
    if (!collection) {
      createResponse(res, StatusCodes.NOT_FOUND, "Collection not found.");
      return;
    }

    // validate owner
    if (collection.user_id !== userId) {
      createResponse(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
      return;
    }

    const recipes = await this.colleRecipeRepo.find({
      where: { collectionId: id },
      select: {
        recipeId: false,
        collectionId: false,
      },
      relations: {
        collection: false,
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
      recipe.recipe.image_path = `http://localhost:3000/public/${recipe.recipe.image_path}`;
    }

    createResponse(res, StatusCodes.OK, ReasonPhrases.OK, recipes);
  }

  async create(req: Request, res: Response) {
    const userId = res.locals.id;
    const { title } = req.body as CreateRequest;

    if (!title) {
      createResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Field title cannot be empty."
      );
      return;
    }

    const collection = new Collection();
    collection.title = title;
    collection.user_id = userId;

    const savedCollection = await this.colleRepo.save(collection);

    if (!savedCollection) {
      createResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
      return;
    }

    createResponse(res, StatusCodes.OK, ReasonPhrases.OK);
  }

  async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const userId = res.locals.id;

    if (!id || isNaN(id)) {
      createResponse(res, StatusCodes.BAD_REQUEST, "Invalid id parameter.");
      return;
    }

    const collection = await this.colleRepo.findOneBy({ id: id });

    // validate collection
    if (!collection) {
      createResponse(res, StatusCodes.NOT_FOUND, "Collection not found.");
      return;
    }

    // validate owner
    if (collection.user_id !== userId) {
      createResponse(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
      return;
    }

    // delete collection
    const deleted = await this.colleRepo.remove(collection);

    if (!deleted) {
      createResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
      return;
    }

    createResponse(res, StatusCodes.OK, ReasonPhrases.OK);
  }

  async update(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const userId = res.locals.id;

    if (!id || isNaN(id)) {
      createResponse(res, StatusCodes.BAD_REQUEST, "Invalid id parameter.");
      return;
    }

    const { title }: UpdateRequest = req.body;

    // validate input
    if (!title) {
      createResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Field title cannot be empty."
      );
      return;
    }

    const collection = await this.colleRepo.findOneBy({ id: id });

    // validate collection
    if (!collection) {
      createResponse(res, StatusCodes.NOT_FOUND, "Collection not found.");
      return;
    }

    // validate owner
    if (collection.user_id !== userId) {
      createResponse(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
      return;
    }

    collection.title = title;

    // update collection
    const savedCollection = await this.colleRepo.save(collection);

    if (!savedCollection) {
      createResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
      return;
    }

    createResponse(res, StatusCodes.OK, ReasonPhrases.OK);
  }

  async addRecipe(req: Request, res: Response) {
    const userId = res.locals.id;
    const collecId = parseInt(req.params.id);
    const { recipe_id } = req.body as AddRecipeRequest;

    if (!collecId || isNaN(collecId)) {
      createResponse(res, StatusCodes.BAD_REQUEST, "Invalid id parameter.");
      return;
    }

    if (!recipe_id) {
      createResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Field recipe_id cannot be empty."
      );
      return;
    }

    const collection = await this.colleRepo.findOneBy({ id: collecId });
    if (!collection) {
      createResponse(res, StatusCodes.NOT_FOUND, "Collection not found.");
      return;
    }

    if (collection.user_id !== userId) {
      createResponse(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
      return;
    }

    const recipe = await this.recipeRepo.findOneBy({ id: recipe_id });

    if (!recipe) {
      createResponse(res, StatusCodes.NOT_FOUND, "Recipe not found.");
      return;
    }

    if (recipe.user_id !== userId) {
      createResponse(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
      return;
    }

    const colleRecipe = new CollectionRecipe();
    colleRecipe.collectionId = collecId;
    colleRecipe.recipeId = recipe_id;

    const addedRecipe = await this.colleRecipeRepo.save(colleRecipe);

    if (!addedRecipe) {
      createResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
      return;
    }

    collection.total_recipe += 1;
    await this.colleRepo.save(collection);

    createResponse(res, StatusCodes.OK, ReasonPhrases.OK);
  }

  async removeRecipe(req: Request, res: Response) {
    const userId = res.locals.id;
    const collecId = parseInt(req.params.id);
    const { recipe_id } = req.body as AddRecipeRequest;

    if (!collecId || isNaN(collecId)) {
      createResponse(res, StatusCodes.BAD_REQUEST, "Invalid id parameter.");
      return;
    }

    if (!recipe_id) {
      createResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Field recipe_id cannot be empty."
      );
      return;
    }

    // validate collection
    const collection = await this.colleRepo.findOneBy({ id: collecId });
    if (!collection) {
      createResponse(res, StatusCodes.NOT_FOUND, "Collection not found.");
      return;
    }

    // validate owner
    if (collection.user_id !== userId) {
      createResponse(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
      return;
    }

    // validate recipe
    const recipe = await this.recipeRepo.findOneBy({ id: recipe_id });

    if (!recipe) {
      createResponse(res, StatusCodes.NOT_FOUND, "Recipe not found.");
      return;
    }

    // validate recipe owner
    if (recipe.user_id !== userId) {
      createResponse(res, StatusCodes.UNAUTHORIZED, ReasonPhrases.UNAUTHORIZED);
      return;
    }

    const colleRecipeToRemove = await this.colleRecipeRepo.findOneBy({
      recipeId: recipe_id,
      collectionId: collecId,
    });

    // validate colleRecipe
    if (!colleRecipeToRemove) {
      createResponse(res, StatusCodes.NOT_FOUND, "Recipe not found.");
      return;
    }

    const deleted = await this.colleRecipeRepo.remove(colleRecipeToRemove);

    if (!deleted) {
      createResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      );
      return;
    }

    collection.total_recipe -= 1;
    await this.colleRepo.save(collection);

    createResponse(res, StatusCodes.OK, ReasonPhrases.OK);
  }
}
