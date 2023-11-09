import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  RelationId,
} from "typeorm";
import { User } from "./User";
import { CollectionRecipe } from "./CollectionRecipe";

export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export enum Tag {
  APPETIZER = "appetizer",
  MAIN_COURSE = "main course",
  DESSERT = "dessert",
  FULL_COURSE = "full course",
}

@Entity()
export class Recipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: "text" })
  desc: string;

  @Column({ type: "enum", enum: Tag })
  tag: Tag;

  @Column({ type: "enum", enum: Difficulty })
  difficulty: Difficulty;

  @Column()
  video_path: string;

  @Column()
  duration: number;

  @Column()
  image_path: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne((type) => User, (user) => user.id, {
    nullable: false,
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  // @RelationId((recipe: Recipe) => recipe.user)
  @Column()
  user_id: number;

  @OneToMany(
    (type) => CollectionRecipe,
    (collectionRecipe) => collectionRecipe.collection
  )
  collectionRecipe: CollectionRecipe[];
}
