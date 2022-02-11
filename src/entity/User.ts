import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm";

import { IsEmail } from "class-validator";
import {Movie} from './Movies'
import {Review} from './Review'
import {Actor} from './Actors'

//create entity for mysql database.
@Entity()
export class User extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable:true, unique: true})
    username: string;

    @Column({nullable:true, unique: true})
    facebookID: string;

    @Column({nullable:true, unique: true})
    googleID: string;

    @Column({nullable:true, unique:true})
    @IsEmail()
    email: string;

    @Column({nullable: true})
    password: string;

    @Column("simple-array", {nullable: true})
    likedmovies: string[];
    
    @Column("simple-array", {nullable: true})
    likedactors: string[];

    @OneToMany(() => Movie, movies => movies.user)
    movies: Movie[];

    @OneToMany(() => Actor, actors => actors.user)
    actors: Actor[];
    
    @OneToMany(() => Review, review => review.user)
    reviews: Review[];
}
