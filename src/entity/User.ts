import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Recipe } from "./Recipe";
import { Collection } from "./Collection";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  name: string;

  @Column()
  password_hash: string;

  @Column()
  is_admin: boolean;

  @OneToMany((type) => Recipe, (recipe) => recipe.user)
  recipes: Recipe[];

  @OneToMany((type) => Collection, (collection) => collection.user)
  collections: Collection[];
}
