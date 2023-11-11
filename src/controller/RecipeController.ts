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
      select: {
        video_path: false, // serve image as static file (publicly available)
      },
      where: {
        user_id: user_id,
      },
      // relations: {
      //   user: true,
      // },
    });

    if (!recipes) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      });
      return;
    }

    for (let recipe of recipes) {
      recipe.image_path = `${process.env.REST_URL}/public/${recipe.image_path}`;
    }

    res
      .status(StatusCodes.OK)
      .json({ message: ReasonPhrases.OK, data: recipes });
  }

  async getDetails(req: Request, res: Response) {
    const user_id = res.locals.id;
    const id = parseInt(req.params.id);

    if (!id || isNaN(id)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
      });

      return;
    }

    const recipe = await this.recipeRepository.findOne({
      select: {
        video_path: false, // serve image as static file (publicly available)
      },
      where: {
        id: id,
      },
      // relations: {
      //   user: true,
      // },
    });

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

    recipe.image_path = `${process.env.REST_URL}/public/${recipe.image_path}`;

    res
      .status(StatusCodes.OK)
      .json({ message: ReasonPhrases.OK, data: recipe });
  }

  async getVideo(req: Request, res: Response) {
    const user_id = res.locals.id;
    const id = parseInt(req.params.id);
    if (!id || isNaN(id)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
      });

      return;
    }

    const recipe = await this.recipeRepository.findOneBy({
      id: id,
    });

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

    res.sendFile(
      path.join(__dirname, "..", "..", "storage", "videos", recipe.video_path)
    );
  }

  async update(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const user_id = res.locals.id;

    if (!id || isNaN(id)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
      });

      return;
    }

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

      if (files?.image?.[0]?.filename) {
        fs.unlinkSync(
          path.join(
            __dirname,
            "..",
            "..",
            "storage",
            "images",
            recipe.image_path
          )
        );
      }

      if (files?.video?.[0]?.filename) {
        fs.unlinkSync(
          path.join(
            __dirname,
            "..",
            "..",
            "storage",
            "videos",
            recipe.video_path
          )
        );
        recipe.video_path = files.video[0].filename;
      }

      return;
    }

    res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
  }

  async create(req: Request, res: Response) {
    const { title, desc, tag, difficulty } = req.body as CreateRequest;

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

    const recipe = new Recipe();
    recipe.title = title;
    recipe.desc = desc;
    recipe.tag = tag;
    recipe.difficulty = difficulty;

    recipe.video_path = files.video[0].filename;
    recipe.image_path = files.image[0].filename;
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

      fs.unlinkSync(
        path.join(
          __dirname,
          "..",
          "..",
          "storage",
          "images",
          files.image[0].filename
        )
      );

      fs.unlinkSync(
        path.join(
          __dirname,
          "..",
          "..",
          "storage",
          "videos",
          files.video[0].filename
        )
      );
      return;
    }

    // response
    res.status(StatusCodes.OK).json({ message: ReasonPhrases.OK });
  }

  async delete(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const user_id = res.locals.id;

    if (!id || isNaN(id)) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: ReasonPhrases.BAD_REQUEST,
      });

      return;
    }

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
