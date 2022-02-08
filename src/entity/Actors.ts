import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, OneToMany } from "typeorm";
import {User} from './User'
import {Review} from './Review'

//create entity for mysql database.
@Entity()
export class Actor extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    name: string;

    @Column()
    image: string;

    @Column("simple-array")
    films: string[];

    @Column({default: false})
    isVisible: boolean;
    
    @Column({ nullable: true, default: 0})
    likes: number;

    @ManyToOne(() => User, user => user.actors, {nullable: false, onDelete: "CASCADE"})
    user: User;

    @OneToMany(() => Review, reviews => reviews.actor)
    reviews: Review[];
}
