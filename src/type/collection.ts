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