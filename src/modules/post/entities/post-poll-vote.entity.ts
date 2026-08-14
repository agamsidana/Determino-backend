import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { PostPollEntity } from "./post-poll.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { PostPollOptionEntity } from "./post-poll-option.entity";

@Entity({name:'post_poll_votes'})
@Unique(
    'UQ_POST_POLL_VOTE_USER',
    ['poll', 'user'],
)
export class PostPollVoteEntity{

    @PrimaryGeneratedColumn('uuid')
    id!:string;

    @CreateDateColumn()
    createdAt!:Date;

    @ManyToOne(()=>PostPollEntity,(postPoll)=>postPoll.votes,{onDelete:'CASCADE',nullable:false})
    poll!:PostPollEntity;

    @ManyToOne(()=>PostPollOptionEntity,(postPollOption)=>postPollOption.votes)
    option!:PostPollOptionEntity;

    @ManyToOne(()=>UserEntity,(user)=>user.pollVotes,{onDelete:'CASCADE',nullable:false})
    user!:UserEntity;


}