import { ChallengeParticipantEntity } from "src/modules/challenge/entities/challenge-participant.entity";
import { ChallengeProgressEntity } from "src/modules/challenge/entities/challenge-progress.entity";
import { QuizAttemptEntity } from "src/modules/challenge/entities/quiz-attempt.entity";
import { ConversationParticipantEntity } from "src/modules/chat/entities/conversation-participant.entity";
import { MessageEntity } from "src/modules/chat/entities/message.entity";
import { PrepMateConnectionEntity } from "src/modules/connection/entities/prepmate-connection.entity";
import { GroupMemberEntity } from "src/modules/group/entities/group-member.entity";
import { GroupEntity } from "src/modules/group/entities/group.entity";
import { AnswerVoteEntity } from "src/modules/post/entities/answer-vote.entity";
import { PostCommentLikeEntity } from "src/modules/post/entities/post-comment-like.entity";
import { PostCommentEntity } from "src/modules/post/entities/post-comment.entity";
import { PostPollVoteEntity } from "src/modules/post/entities/post-poll-vote.entity";
import { PostReactionEntity } from "src/modules/post/entities/post-reaction.entity";
import { PostSaveEntity } from "src/modules/post/entities/post-save.entity";
import { PostEntity } from "src/modules/post/entities/post.entity";
import { QuestionAnswerEntity } from "src/modules/post/entities/question-answer.entity";
import { ProfileEntity } from "src/modules/profile/entities/profile.entity";
import { StudySessionEntity } from "src/modules/study-session/entities/study-session.entity";
import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'users' })
export class UserEntity {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        unique: true
    })
    email!: string;

    @Column({
        nullable: true,
        select: false,
    })
    password!: string;

    @Column({ nullable: true })
    lastSeenAt!: Date;

    @Column({ default: false })
    isEmailVerified!: boolean;

    @Column({
        nullable: true,
        select: false,
    })
    emailVerificationCode!: string;

    @Column({
        type:'timestamp',
        nullable:true,
        select:false
    })
    emailVerificationCodeExpiresAt!: Date;

    @Column({
        nullable:true,
        select:false
    })
    passwordResetCode!:string;

    @Column({
        nullable:true,
        select:false
    })
    passwordResetCodeExpiresAt!:Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToOne(() => ProfileEntity, (profile) => profile.user)
    profile!: ProfileEntity;

    @OneToMany(() => StudySessionEntity, (studySession) => studySession.user)
    studySessions!: StudySessionEntity[];

    @OneToMany(() => PostEntity, (post) => post.user)
    posts!: PostEntity[];

    @OneToMany(() => PostReactionEntity, (postReaction) => postReaction.user)
    postReactions!: PostReactionEntity[];

    @OneToMany(() => PostPollVoteEntity, (postPollVotes) => postPollVotes.user)
    pollVotes!: PostPollVoteEntity[];

    @OneToMany(() => PostCommentEntity, (postComment) => postComment.user)
    postComments!: PostCommentEntity[];

    @OneToMany(() => PostSaveEntity, (postSave) => postSave.user)
    postSaves!: PostSaveEntity[];

    @OneToMany(() => PostCommentLikeEntity, (postCommentLike) => postCommentLike.user)
    commentLikes!: PostCommentLikeEntity[];

    @OneToMany(() => QuestionAnswerEntity, (questionAnswer) => questionAnswer.user)
    answers!: QuestionAnswerEntity[];

    @OneToMany(() => AnswerVoteEntity, (answerVote) => answerVote.user)
    answerVotes!: AnswerVoteEntity[];

    @OneToMany(() => GroupEntity, (group) => group.createdBy)
    createdGroups!: GroupEntity[];

    @OneToMany(() => GroupMemberEntity, (groupMember) => groupMember.user)
    groupMemberships!: GroupMemberEntity[];

    @OneToMany(() => ConversationParticipantEntity, (conversationParticipant) => conversationParticipant.user)
    conversationParticipations!: ConversationParticipantEntity[];

    @OneToMany(() => MessageEntity, (message) => message.sender)
    messagesSent!: MessageEntity[];

    @OneToMany(()=>ChallengeParticipantEntity,(challengeParticipant)=>challengeParticipant.user)
    challengeParticipations!:ChallengeParticipantEntity[];

    @OneToMany(()=>ChallengeProgressEntity,(challengeProgress)=>challengeProgress.user)
    challengeProgress!:ChallengeProgressEntity[];

    @OneToMany(()=>QuizAttemptEntity,(quizAttempt)=>quizAttempt.user)
    quizAttempts!:QuizAttemptEntity[];

    @OneToMany(()=>PrepMateConnectionEntity,(prepMateConnection)=>prepMateConnection.userLow)
    prepmateConnectionsAsLowUser!: PrepMateConnectionEntity[];

    @OneToMany(()=>PrepMateConnectionEntity,(prepMateConnection)=>prepMateConnection.userHigh)
    prepmateConnectionsAsHighUser!: PrepMateConnectionEntity[];

    @OneToMany(()=>PrepMateConnectionEntity,(prepMateConnection)=>prepMateConnection.requester)
    prepmateRequestsSent!:PrepMateConnectionEntity[];

    @OneToMany(()=>PrepMateConnectionEntity,(prepMateConnection)=>prepMateConnection.receiver)
    prepmateRequestsReceived!:PrepMateConnectionEntity[];


}