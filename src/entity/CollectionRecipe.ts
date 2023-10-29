import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Recipe } from "./Recipe";
import { Collection } from "./Collection";

@Entity()
export class CollectionRecipe {
  @PrimaryColumn()
  recipeId: number;

  @PrimaryColumn()
  collectionId: number;

  @ManyToOne((type) => Recipe, (recipe) => recipe.collectionRecipe, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "recipeId" })
  recipe: Recipe;

  @ManyToOne(
    (type) => Collection,
    (collection) => collection.collectionRecipe,
    { cascade: true, onDelete: "CASCADE" }
  )
  @JoinColumn({ name: "collectionId" })
  collection: Collection;
}
