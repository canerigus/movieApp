import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import { Contains, IsInt, Length, IsEmail, IsFQDN, IsDate, Min, Max } from "class-validator";
import {User} from './User'
import {Review} from './Review'

//create entity for mysql database.
@Entity()
export class Movie extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: 'movie Title'})
    title: string;

    @Column({default: 'movie Year'})
    year: string;
    
    @Column({default: 'https://static.wikia.nocookie.net/disney/images/1/1c/Dinosaur_Url-disneyscreencaps_com-7324.jpg/revision/latest?cb=20110730154056'})
    image: string;

    @Column({default: 'movie description'})
    plot: string;

    @Column({default: '11111'})
    imdbID: string;

    @Column({default: '1000'})
    imdbRating: string;

    @Column({default: false})
    isVisible: boolean;

    @ManyToOne(() => User, user => user.movies, {nullable: false, onDelete: "CASCADE"})
    user: User;

    @OneToMany(() => Review, reviews => reviews.movie)
    reviews: Review[];
}
