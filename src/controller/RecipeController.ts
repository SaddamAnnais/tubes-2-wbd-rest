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

  async get(req: Request, res: Response) {}

  async update(req: Request, res: Response) {
    console.log("masuk update");
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
    console.log(title, desc, tag, difficulty);

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
    console.log("masuk create");
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
    console.log("sini2");
    recipe.user_id = res.locals.id;

    // saving into database
    const savedRecipe = await this.recipeRepository.save(recipe);
    console.log("sini2");

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
}
