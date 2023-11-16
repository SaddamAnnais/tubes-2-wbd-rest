export interface CreateRequest {
  title: string;
}

export interface UpdateRequest {
  title?: string;
  cover?: string;
}

export interface AddRecipeRequest {
  recipe_id: number;
}

export interface RemoveRecipeRequest {
  recipe_id: number;
}

export interface CollecWithCover {
  id: number;
  title: string;
  created_at: Date;
  total_recipe: number;
  cover: string;
  user_id: number;
}
