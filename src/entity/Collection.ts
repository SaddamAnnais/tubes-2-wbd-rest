import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
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

  @Column({ type: "int", default: 0 })
  total_recipe: number;

  @ManyToOne((type) => User, (user) => user.id, {
    nullable: false,
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column()
  user_id: number;

  @OneToMany(
    (type) => CollectionRecipe,
    (collectionRecipe) => collectionRecipe.collection
  )
  collectionRecipe: CollectionRecipe[];
}
