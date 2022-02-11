import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from "typeorm";
import {User} from './User'
import {Movie} from './Movies'
import { Actor  } from './Actors'

//create entity for mysql database.

@Entity()
export class Review extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable:false})
    body: string;

    @Column({ nullable: true, default: 0})
    rating: number;

    @Column({nullable: true})
    username: string

    @Column({nullable: false})
    userId: number

    @ManyToOne(() => User, user => user.reviews, {onDelete: "CASCADE"})
    user: User;

    @ManyToOne(() => Movie, movie => movie.reviews, {onDelete: "CASCADE"})
    movie: Movie;

    @ManyToOne(() => Actor, actor => actor.reviews, {onDelete: "CASCADE"})
    actor: Actor;
}
