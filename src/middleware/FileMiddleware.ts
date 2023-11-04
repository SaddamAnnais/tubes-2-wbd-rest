import { Request } from "express";
import multer from "multer";
import * as path from "path";
import { v4 } from "uuid";

export class FileMiddleware {
  private fileStorage = multer.diskStorage({
    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void
    ) => {
      if (file.fieldname === "video") {
        // if uploading video
        cb(null, path.join(__dirname, "..", "..", "storage", "videos"));
      } else {
        // else uploading image
        cb(null, path.join(__dirname, "..", "..", "storage", "images"));
      }
    },
    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void
    ) => {
      // naming file
      cb(null, v4() + path.extname(file.originalname));
    },
  });

  private fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, ret: boolean) => void
  ) => {
    if (file.fieldname === "video") {
      // if uploading video
      if (file.mimetype === "video/mp4") {
        // check file type to be mp4
        cb(null, true);
      } else {
        cb(null, false); // else fails
      }
    } else {
      // else uploading image
      if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
      ) {
        // check file type to be png, jpeg, or jpg
        cb(null, true);
      } else {
        cb(null, false); // else fails
      }
    }
  };

  private storage = multer({
    storage: this.fileStorage,
    limits: {
      fileSize: 41943040, // 40 MB
    },
    fileFilter: this.fileFilter,
  });

  public upload_video_image() {
    return this.storage.fields([
      {
        name: "video",
        maxCount: 1,
      },
      {
        name: "image",
        maxCount: 1,
      },
    ]);
  }
}
