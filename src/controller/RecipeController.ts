import { AppDataSource } from "../config/data-source";
import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { Recipe } from "../entity/Recipe";
import { CreateRequest, UpdateRequest } from "../type/recipe";
import getVideoDurationInSeconds from "get-video-duration";
import * as path from "path";
import * as fs from "fs";

export class RecipeController {
  private recipeRepository = AppDataSource.getRepository(Recipe);

  async getAll(req: Request, res: Response) {
    const user_id = res.locals.id;
    const recipes = await this.recipeRepository.find({
      where: {
        user_id: user_id,
      },
      // TODO: FILES?
      relations: {
        user: true,
      },
      //
    });

    if (!recipes) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      });
      return;
    }

    res
      .status(StatusCodes.OK)
      .json({ message: ReasonPhrases.OK, data: recipes });
  }

  async get(req: Request, res: Response) {
    const user_id = res.locals.id;
    const id = parseInt(req.params.id);
    const recipe = await this.recipeRepository.findOneBy({
      id: id,
    });

    // TODO: FILES

    if (!recipe) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: ReasonPhrases.NOT_FOUND,
      });
      return;
    }

    if (recipe.user_id !== user_id) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: ReasonPhrases.UNAUTHORIZED,
      });
    }

    res
      .status(StatusCodes.OK)
      .json({ message: ReasonPhrases.OK, data: recipe });
  }

  async update(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const user_id = res.locals.id;

    const recipe = await this.recipeRepository.findOneBy({ id: id });

    if (!recipe) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: ReasonPhrases.NOT_FOUND,
      });

      return;
    }

    if (recipe.user_id !== user_id) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: ReasonPhrases.UNAUTHORIZED,
      });

      return;
    }

    const { title, desc, tag, difficulty }: UpdateRequest = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    // if input is invalid
    if (!title || !desc || !tag || !difficulty) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
      });
      return;
    }

    recipe.title = title;
    recipe.desc = desc;
    recipe.tag = tag;
    recipe.difficulty = difficulty;

    // video changed
    if (files?.video?.[0]?.filename) {
      fs.unlinkSync(
        path.join(__dirname, "..", "..", "storage", "videos", recipe.video_path)
      );
      recipe.video_path = files.video[0].filename;
      recipe.duration = Math.floor(
        await getVideoDurationInSeconds(
          path.join(
            __dirname,
            "..",
            "..",
            "storage",
            "videos",
            recipe.video_path
          )
        )
      );
    }

    // image changed
    if (files?.image?.[0]?.filename) {
      fs.unlinkSync(
        path.join(__dirname, "..", "..", "storage", "images", recipe.image_path)
      );
      recipe.image_path = files.image[0].filename;
    }

    const savedRecipe = await this.recipeRepository.save(recipe);

    if (!savedRecipe) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      });
      return;
    }

    res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
  }

  async create(req: Request, res: Response) {
    console.log("create");
    const { title, desc, tag, difficulty }: CreateRequest = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    // if input is invalid
    if (
      !title ||
      !desc ||
      !tag ||
      !difficulty ||
      !files?.video?.[0]?.filename ||
      !files?.image?.[0]?.filename
    ) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
      });
      return;
    }

    // making the user class
    const recipe = new Recipe();
    recipe.title = title;
    recipe.desc = desc;
    recipe.tag = tag;
    recipe.difficulty = difficulty;

    recipe.video_path = files.video[0].filename;
    recipe.image_path = files.image[0].filename;
    console.log("sini");
    recipe.duration = Math.floor(
      await getVideoDurationInSeconds(
        path.join(__dirname, "..", "..", "storage", "videos", recipe.video_path)
      )
    );
    recipe.user_id = res.locals.id;

    // saving into database
    const savedRecipe = await this.recipeRepository.save(recipe);

    // if failed to save the recipe
    if (!savedRecipe) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      });
      return;
    }

    // response
    res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
  }

  async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const user_id = res.locals.id;

    const recipe = await this.recipeRepository.findOneBy({ id: id });

    if (!recipe) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: ReasonPhrases.NOT_FOUND,
      });

      return;
    }

    if (recipe.user_id !== user_id) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: ReasonPhrases.UNAUTHORIZED,
      });

      return;
    }

    const deleted = await this.recipeRepository.remove(recipe);

    if (!deleted) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: ReasonPhrases.INTERNAL_SERVER_ERROR });

      return;
    }

    fs.unlinkSync(
      path.join(__dirname, "..", "..", "storage", "images", deleted.image_path)
    );

    fs.unlinkSync(
      path.join(__dirname, "..", "..", "storage", "videos", deleted.video_path)
    );

    res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
  }
}
