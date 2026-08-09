import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ReactionType } from "../enums/reaction-type.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { PostEntity } from "./post.entity";


@Entity({ name: 'post_reactions' })
@Unique('UQ_POST_REACTION_USER_POST_TYPE', ['user', 'post', 'type'])
export class PostReactionEntity {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'enum',
        enum: ReactionType
    })
    type!: ReactionType;

    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(() => UserEntity, (user) => user.postReactions, {
        onDelete: 'CASCADE',
        nullable: false
    })
    user!: UserEntity;

    @ManyToOne(() => PostEntity, (post) => post.reactions, {
        onDelete: 'CASCADE',
        nullable: false
    })
    post!: PostEntity;


}