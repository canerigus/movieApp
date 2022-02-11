import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import {User} from './User'
import {Review} from './Review'

//create entity for mysql database.
@Entity()
export class Movie extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable:false})
    title: string;

    @Column({nullable:false})
    year: string;
    
    @Column({nullable:true,default: 'https://static.wikia.nocookie.net/disney/images/1/1c/Dinosaur_Url-disneyscreencaps_com-7324.jpg/revision/latest?cb=20110730154056'})
    image: string;

    @Column({nullable:true,  default: 'movie description not found'})
    plot: string;

    @Column({nullable:true,default: '111111111'})
    imdbID: string;

    @Column({nullable:true, default: '1000'})
    imdbRating: string;

    @Column({default: false})
    isVisible: boolean;

    @Column({ nullable: true, default: 0})
    likescount: number;

    @ManyToOne(() => User, user => user.movies, {nullable: false, onDelete: "CASCADE"})
    user: User;

    @OneToMany(() => Review, reviews => reviews.movie)
    reviews: Review[];
}
