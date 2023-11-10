import { Difficulty, Tag } from "../entity/Recipe";

export interface CreateRequest {
  title: string;
  desc: string;
  tag: Tag;
  difficulty: Difficulty;
}

export interface UpdateRequest {
  title?: string;
  desc?: string;
  tag?: Tag;
  difficulty?: Difficulty;
}
