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
export class Collection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  cover: string;

  @Column({ type: "int" })
  total_recipe: number;

  @ManyToOne((type) => User, (user) => user.collections, {
    nullable: false,
    cascade: true,
    onDelete: "CASCADE"
  })
  user: User;

  @OneToMany(
    (type) => CollectionRecipe,
    (collectionRecipe) => collectionRecipe.collection
  )
  collectionRecipe: CollectionRecipe[];
}
