import { UserEntity } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PostType } from "../enums/post-type.enum";
import { PostReactionEntity } from "./post-reaction.entity";

@Entity({ name: 'posts' })
export class PostEntity {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    title!: string;

    @Column()
    content!: string;

    @Column({ type: 'enum', enum: PostType })
    type!: PostType;

    @Column({ default: false })
    isDeleted!: boolean

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @ManyToOne(() => UserEntity, (user) => user.posts)
    user!: UserEntity;

    @OneToMany(() => PostReactionEntity, (postReaction) => postReaction.post)
    reactions!: PostReactionEntity[]

}