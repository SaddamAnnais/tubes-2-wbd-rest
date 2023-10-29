import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { CollectionRecipe } from "./CollectionRecipe";

@Entity()
export class Recipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: "text" })
  desc: string;

  @Column()
  tag: string;

  @Column()
  difficulty: string;

  @Column()
  video_path: string;

  @Column()
  duration: number;

  @Column()
  image_path: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne((type) => User, (user) => user.recipes, {
    nullable: false,
    cascade: true,
    onDelete: "CASCADE",
  })
  user: User;

  @OneToMany(
    (type) => CollectionRecipe,
    (collectionRecipe) => collectionRecipe.collection
  )
  collectionRecipe: CollectionRecipe[];
}
