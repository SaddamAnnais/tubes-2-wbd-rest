import { AppDataSource } from "../config/data-source";
import { Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { Recipe } from "../entity/Recipe";
import { CreateRequest } from "../type/recipe";
import getVideoDurationInSeconds from "get-video-duration";
import * as path from "path";

export class RecipeController {
  private recipeRepository = AppDataSource.getRepository(Recipe);

  async get(req: Request, res: Response) {}

  async edit(req: Request, res: Response) {}

  async create(req: Request, res: Response) {
    const { title, desc, tag, difficulty }: CreateRequest = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    // if input is invalid
    if (
      !title ||
      !desc ||
      !tag ||
      !difficulty ||
      !files.video[0].filename ||
      !files.image[0].filename ||
      !res.locals.id
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
    recipe.duration = await getVideoDurationInSeconds(
      path.join(__dirname, "..", "..", "storage", "videos", recipe.video_path)
    );
    recipe.user_id = res.locals.id;
    res.json({ message: "Recipe created." });

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
    res.status(StatusCodes.OK);
  }

  async addToCollection(req: Request, res: Response) {}
}
