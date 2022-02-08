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

    @Column({nullable:true, default:'https://images.unsplash.com/photo-1458134580443-fbb0743304eb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1025&q=80'})
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
