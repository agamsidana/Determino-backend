import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileEntity } from './entities/profile.entity';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { CreateProfileData } from './interfaces/create-profile-data.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { USER_MESSAGES } from 'src/shared/constants/messages/user.messages';
import { UserEntity } from '../user/entities/user.entity';
import { ExamService } from '../exam/exam.service';
import { OnboardingStep } from './enums/onboardingStep.enum';
import { OnboardingScreen } from './enums/onboardingScreen.enum';
import { GoalService } from '../goal/goal.service';
import { UpdateProfileResponseDto } from './dto/update-profile-response.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { CreateAvatarUploadDto } from './dto/create-avatar-upload.dto';
import { AvatarUploadEntity } from './entities/avatar-upload.entity';
import { randomUUID } from 'crypto';
import { SupabaseStorageService } from 'src/shared/supabase/supabase-storage.service';
import { ConfirmAvatarUploadDto } from './dto/confirm-avatar-upload.dto';
import { StudySessionService } from '../study-session/study-session.service';
import { PostService } from '../post/post.service';
import { ConnectionService } from '../connection/connection.service';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';
import { PollResult } from '../post/interfaces/poll-result.interface';
import { PostType } from '../post/enums/post-type.enum';
import { ReactionType } from '../post/enums/reaction-type.enum';
import { PostEntity } from '../post/entities/post.entity';
import { PostAttachmentEntity } from '../post/entities/post-attachment.entity';
import { PostAttachmentType } from '../post/enums/post-attachment-type.enum';
import { PostPollOptionEntity } from '../post/entities/post-poll-option.entity';
import { PostPollVoteEntity } from '../post/entities/post-poll-vote.entity';
import { PostSaveEntity } from '../post/entities/post-save.entity';

@Injectable()
export class ProfileService {

    constructor(@InjectRepository(ProfileEntity) private readonly profileRepository: Repository<ProfileEntity>, @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>, @InjectRepository(AvatarUploadEntity) private readonly avatarUploadRepository: Repository<AvatarUploadEntity>,@InjectRepository(PostEntity) private readonly postRepository:Repository<PostEntity>,@InjectRepository(PostAttachmentEntity) private readonly postAttachmentRepository:Repository<PostAttachmentEntity>, @InjectRepository(PostPollOptionEntity) private readonly postPollOptionRepository:Repository<PostPollOptionEntity>,@InjectRepository(PostPollVoteEntity) private readonly postPollVoteRepository:Repository<PostPollVoteEntity>,@InjectRepository(PostSaveEntity) private readonly postSaveRepository:Repository<PostSaveEntity>, private readonly examService: ExamService, private readonly goalService: GoalService, private readonly supabaseStorageService: SupabaseStorageService,private readonly studySessionService:StudySessionService,private readonly postService:PostService,private readonly connectionService:ConnectionService, private readonly dataSource: DataSource) { }

    async createProfile(data: CreateProfileData, manager?: EntityManager): Promise<ProfileEntity> {

        const repository = manager ? manager.getRepository(ProfileEntity) : this.profileRepository;

        const profile = repository.create(data);

        const savedProfile = await repository.save(profile);

        return savedProfile;

    }

    async updateProfile(user: UserEntity, dto: UpdateProfileDto): Promise<UpdateProfileResponseDto> {

        const profile = await this.profileRepository.findOne({
            where: {
                user: {
                    id: user.id
                }
            },
            relations: {
                exam: true,
                goals: true
            }
        });

        if (!profile) {
            throw new NotFoundException(USER_MESSAGES.USER_PROFILE_NOT_FOUND);
        }

        await this.updateOnboardingState(profile, dto);

        Object.assign(profile, dto);

        await this.profileRepository.save(profile);

        const savedProfile = await this.profileRepository.findOne({
            where: {
                id: profile.id,
            },
            relations: {
                exam: true,
                goals: true,
            },
        }) as ProfileEntity;

        return {
            data: {
                id: user.id,
                email: user.email,
                profile: {
                    firstName: savedProfile.firstName,
                    lastName: savedProfile.lastName,
                    avatar: savedProfile.avatar,
                    role: savedProfile.role,
                    currentOnboardingStep: savedProfile.currentOnboardingStep,
                    isOnboardingCompleted: savedProfile.isOnboardingCompleted,
                    exam: savedProfile.exam
                        ? {
                            id: savedProfile.exam.id,
                            name: savedProfile.exam.name,
                        }
                        : null,
                    goals: profile.goals.length ? profile.goals.map((goal) => ({ id: goal.id, name: goal.name })) : null
                },
            },
        };


    }

    private async updateOnboardingState(
        profile: ProfileEntity,
        dto: UpdateProfileDto,
    ) {

        if (dto.screen === OnboardingScreen.WELCOME) {
            profile.currentOnboardingStep = OnboardingStep.ROLE;
        }

        if (dto.role !== undefined) {
            profile.currentOnboardingStep = OnboardingStep.EXAM;
        }

        if (dto.examId !== undefined) {

            const exam = await this.examService.findExamById(dto.examId);

            if (!exam) {
                throw new NotFoundException(USER_MESSAGES.EXAM_NOT_FOUND);
            }

            profile.exam = exam;
            profile.currentOnboardingStep = OnboardingStep.COMPLETED;
        }

        if (dto.goalIds !== undefined) {
            const goals = await this.goalService.findGoalsByIds(dto.goalIds);

            if (goals.length !== dto.goalIds.length) {
                throw new NotFoundException(USER_MESSAGES.GOAL_NOT_FOUND);
            }

            profile.goals = goals;

            profile.currentOnboardingStep = OnboardingStep.COMPLETED;
            profile.isOnboardingCompleted = true;
        }
    }

    async getMyProfile(userId: string) {

        const user = await this.userRepository.findOne({
            where: {
                id: userId
            },
            relations: {
                profile: {
                    exam: true
                },
            }
        });
        if (!user) {
            throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
        }

        const [totalStudyMinutes,totalPosts,totalDoubts,totalPrepMates] = await Promise.all([
            this.studySessionService.getTotalStudyMinutes(user.id),
            this.postService.getTotalPosts(user.id),
            this.postService.getTotalDoubts(user.id),
            this.connectionService.getTotalPrepMates(user.id)            
        ]);

        return {
            data: {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
                profile: {
                    firstName: user.profile.firstName,
                    lastName: user.profile.lastName,
                    role: user.profile.role,
                    bio: user.profile.bio,
                    avatar: user.profile.avatar,
                    exam: user.profile.exam
                        ? {
                            id: user.profile.exam.id,
                            name: user.profile.exam.name
                        }
                        : null,
                },

                stats:{
                    totalStudyMinutes,
                    totalPosts,
                    totalDoubts,
                    totalPrepMates
                }
            },
        };

    }

    async updateMyProfile(userId: string, dto: UpdateMyProfileDto) {

        const user = await this.userRepository.findOne({
            where: {
                id: userId,
            },
            relations: {
                profile: {
                    exam: true,
                },
            },
        });

        if (!user) {
            throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
        }

        if (!user.profile) {
            throw new NotFoundException(
                USER_MESSAGES.USER_PROFILE_NOT_FOUND,
            );
        }

        Object.assign(user.profile, dto);

        await this.profileRepository.save(user.profile);

        return {
            data: {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
                profile: {
                    firstName: user.profile.firstName,
                    lastName: user.profile.lastName,
                    role: user.profile.role,
                    bio: user.profile.bio,
                    avatar: user.profile.avatar,
                    exam: user.profile.exam
                        ? {
                            id: user.profile.exam.id,
                            name: user.profile.exam.name,
                        }
                        : null,
                },
            },
        };
    }

    async getMyPosts( userId: string, query: PaginationQueryDto ) {
        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const queryBuilder = this.postRepository
            .createQueryBuilder('post')

            .leftJoinAndSelect('post.user', 'user')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('profile.exam', 'exam')

            .leftJoin(
                'post.reactions',
                'reaction',
                'reaction.type = :reactionType',
                {
                    reactionType: ReactionType.HELPFUL,
                },
            )

            .leftJoin(
                'post.comments',
                'comment',
                'comment.isDeleted = :isDeleted',
                {
                    isDeleted: false,
                },
            )

            .where('post.isDeleted = :isDeleted', {
                isDeleted: false,
            })

            .andWhere('post.type = :type', {
                type: PostType.POST,
            })

            // Only current user's posts
            .andWhere('user.id = :userId', {
                userId,
            })

            .addSelect(
                'COUNT(DISTINCT reaction.id)',
                'helpfulCount',
            )

            .addSelect(
                'COUNT(DISTINCT comment.id)',
                'replyCount',
            )

            .addSelect(
                `EXISTS (
                SELECT 1
                FROM post_reactions user_reaction
                WHERE user_reaction."postId" = post.id
                AND user_reaction."userId" = :userId
                AND user_reaction.type = :reactionType
            )`,
                'isHelpful',
            )

            .addSelect(
                `EXISTS (
                SELECT 1
                FROM post_saves user_save
                WHERE user_save."postId" = post.id
                AND user_save."userId" = :userId
            )`,
                'isSaved',
            )

            .setParameter('userId', userId)

            .orderBy('post.createdAt', 'DESC')

            .groupBy('post.id')
            .addGroupBy('user.id')
            .addGroupBy('profile.id')
            .addGroupBy('exam.id')

            .skip(skip)
            .take(limit);

        const { entities, raw } =
            await queryBuilder.getRawAndEntities();

        const postIds = entities.map(
            (post) => post.id,
        );

        // Attachments
        const attachments = postIds.length
            ? await this.postAttachmentRepository.find({
                where: {
                    post: {
                        id: In(postIds),
                    },
                },
                relations: {
                    post: true,
                },
            })
            : [];

        const attachmentsWithUrls =
            await Promise.all(
                attachments.map(async (attachment) => {
                    let url: string | null = null;

                    if (
                        attachment.type ===
                        PostAttachmentType.LINK
                    ) {
                        url = attachment.url;
                    } else {
                        url =
                            await this.supabaseStorageService.createDownloadUrl(
                                'post-attachments',
                                attachment.storagePath,
                                60 * 60,
                            );
                    }

                    return {
                        id: attachment.id,
                        postId: attachment.post.id,
                        type: attachment.type,
                        fileName: attachment.fileName,
                        mimeType: attachment.mimeType,
                        fileSize: attachment.fileSize,
                        url,
                    };
                }),
            );

        const attachmentsByPost =
            new Map<string, typeof attachmentsWithUrls>();

        for (const attachment of attachmentsWithUrls) {
            const existing =
                attachmentsByPost.get(
                    attachment.postId,
                ) ?? [];

            existing.push(attachment);

            attachmentsByPost.set(
                attachment.postId,
                existing,
            );
        }


        //Hashtags
        const postWithHashtags =
            postIds.length
                ? await this.postRepository.find({
                    where: {
                        id: In(postIds),
                    },
                    relations: {
                        hashtags: true,
                    },
                })
                : [];

        const hashtagsByPost = new Map(
            postWithHashtags.map((post) => [
                post.id,
                post.hashtags.map((hashtag) => ({
                    id: hashtag.id,
                    name: hashtag.name,
                })),
            ]),
        );


        //Polls
        const pollsRaw = postIds.length
            ? await this.postPollOptionRepository
                .createQueryBuilder('option')

                .innerJoin(
                    'option.postPoll',
                    'poll',
                )

                .innerJoin(
                    'poll.post',
                    'post',
                )

                .leftJoin(
                    'option.votes',
                    'vote',
                )

                .addSelect(
                    'COUNT(DISTINCT vote.id)',
                    'voteCount',
                )

                .addSelect(
                    'poll.id',
                    'pollId',
                )

                .addSelect(
                    'post.id',
                    'postId',
                )

                .where(
                    'post.id IN (:...postIds)',
                    { postIds },
                )

                .groupBy('option.id')
                .addGroupBy('poll.id')
                .addGroupBy('post.id')

                .orderBy(
                    'option.position',
                    'ASC',
                )

                .getRawAndEntities()
            : {
                entities: [],
                raw: [],
            };


        // Current User Poll Vote's
        const userVotes = postIds.length
            ? await this.postPollVoteRepository.find({
                where: {
                    user: {
                        id: userId,
                    },
                    poll: {
                        post: {
                            id: In(postIds),
                        },
                    },
                },
                relations: {
                    option: true,
                    poll: true,
                },
            })
            : [];

        const votedOptionByPoll =
            new Map(
                userVotes.map((vote) => [
                    vote.poll.id,
                    vote.option.id,
                ]),
            );

        const pollByPost =
            new Map<string, PollResult>();

        pollsRaw.entities.forEach(
            (option, index) => {
                const rawData =
                    pollsRaw.raw[index];

                const postId =
                    rawData.postId;

                const pollId =
                    rawData.pollId;

                const existing: PollResult =
                    pollByPost.get(postId) ?? {
                        id: pollId,
                        options: [],
                    };

                existing.options.push({
                    id: option.id,
                    text: option.text,
                    position: option.position,
                    voteCount:
                        Number(rawData.voteCount),
                    isSelected:
                        votedOptionByPoll.get(
                            pollId,
                        ) === option.id,
                });

                pollByPost.set(
                    postId,
                    existing,
                );
            },
        );


        const transformedPosts =
            entities.map((post, index) => {
                const postAttachments =
                    attachmentsByPost.get(
                        post.id,
                    ) ?? [];

                return {
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    type: post.type,
                    createdAt: post.createdAt,

                    author: {
                        id: post.user.id,
                        name: `${post.user.profile.firstName} ${post.user.profile.lastName}`,
                        exam:
                            post.user.profile.exam
                                ?.name ?? null,
                    },

                    helpfulCount:
                        Number(
                            raw[index].helpfulCount,
                        ),

                    replyCount:
                        Number(
                            raw[index].replyCount,
                        ),

                    isSaved:
                        raw[index].isSaved === true ||
                        raw[index].isSaved === 'true',

                    isHelpful:
                        raw[index].isHelpful === true ||
                        raw[index].isHelpful === 'true',

                    hashtags:
                        hashtagsByPost.get(
                            post.id,
                        ) ?? [],

                    poll:
                        pollByPost.get(
                            post.id,
                        ) ?? null,

                    attachments:
                        postAttachments.map(
                            (attachment) => ({
                                id: attachment.id,
                                type: attachment.type,
                                fileName:
                                    attachment.fileName,
                                mimeType:
                                    attachment.mimeType,
                                fileSize:
                                    attachment.fileSize,
                                url: attachment.url,
                            }),
                        ),
                };
            });

        const total =
            await this.postRepository.count({
                where: {
                    user: {
                        id: userId,
                    },
                    type: PostType.POST,
                    isDeleted: false,
                },
            });

        return {
            data: {
                posts: transformedPosts,
            },

            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(
                    total / limit,
                ),
            },
        };
    }

    async getMySavedPosts(userId: string, query: PaginationQueryDto) {

        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const queryBuilder = this.postSaveRepository
            .createQueryBuilder('postSave')

            .innerJoinAndSelect('postSave.post', 'post')

            .leftJoinAndSelect('post.user', 'user')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('profile.exam', 'exam')

            .leftJoin(
                'post.reactions',
                'reaction',
                'reaction.type = :reactionType',
                {
                    reactionType: ReactionType.HELPFUL,
                },
            )

            .leftJoin(
                'post.comments',
                'comment',
                'comment.isDeleted = :isDeleted',
                {
                    isDeleted: false,
                },
            )

            .where('postSave.user.id = :userId', {
                userId,
            })

            .andWhere('post.isDeleted = :isDeleted', {
                isDeleted: false,
            })

            .andWhere('post.type = :type', {
                type: PostType.POST,
            })

            .addSelect(
                'COUNT(DISTINCT reaction.id)',
                'helpfulCount',
            )

            .addSelect(
                'COUNT(DISTINCT comment.id)',
                'replyCount',
            )

            .addSelect(
                `EXISTS (
                SELECT 1
                FROM post_reactions user_reaction
                WHERE user_reaction."postId" = post.id
                    AND user_reaction."userId" = :userId
                    AND user_reaction.type = :reactionType
            )`,
                'isHelpful',
            )

            .addSelect(
                `EXISTS (
                SELECT 1
                FROM post_saves user_save
                WHERE user_save."postId" = post.id
                    AND user_save."userId" = :userId
            )`,
                'isSaved',
            )

            .setParameter('userId', userId)

            .orderBy(
                'postSave.createdAt',
                'DESC',
            )

            .groupBy('post.id')
            .addGroupBy('postSave.id')
            .addGroupBy('user.id')
            .addGroupBy('profile.id')
            .addGroupBy('exam.id')

            .skip(skip)
            .take(limit);

        const {
            entities,
            raw,
        } = await queryBuilder.getRawAndEntities();


        
        // Attachments
        const postIds = entities.map(
            post => post.id,
        );

        const attachments = postIds.length
            ? await this.postAttachmentRepository.find({
                where: {
                    post: {
                        id: In(postIds),
                    },
                },
                relations: {
                    post: true,
                },
            })
            : [];

        const attachmentsWithUrls =
            await Promise.all(
                attachments.map(
                    async attachment => {

                        let url: string | null = null;

                        if (
                            attachment.type ===
                            PostAttachmentType.LINK
                        ) {
                            url = attachment.url;
                        }

                        else {

                            url =
                                await this
                                    .supabaseStorageService
                                    .createDownloadUrl(
                                        'post-attachments',
                                        attachment.storagePath,
                                        60 * 60,
                                    );
                        }

                        return {
                            id: attachment.id,
                            postId: attachment.post.id,
                            type: attachment.type,
                            fileName: attachment.fileName,
                            mimeType: attachment.mimeType,
                            fileSize: attachment.fileSize,
                            url,
                        };
                    },
                ),
            );

        const attachmentsByPost =
            new Map<
                string,
                typeof attachmentsWithUrls
            >();

        for (
            const attachment
            of attachmentsWithUrls
        ) {

            const existing =
                attachmentsByPost.get(
                    attachment.postId,
                ) ?? [];

            existing.push(attachment);

            attachmentsByPost.set(
                attachment.postId,
                existing,
            );
        }



        // Hashtags
        const postWithHashtags =
            postIds.length
                ? await this.postRepository.find({
                    where: {
                        id: In(postIds),
                    },
                    relations: {
                        hashtags: true,
                    },
                })
                : [];

        const hashtagsByPost =
            new Map(
                postWithHashtags.map(
                    p => [
                        p.id,
                        p.hashtags.map(
                            h => ({
                                id: h.id,
                                name: h.name,
                            }),
                        ),
                    ],
                ),
            );



        // Polls
        const pollsRaw =
            postIds.length
                ? await this
                    .postPollOptionRepository
                    .createQueryBuilder('option')

                    .innerJoin(
                        'option.postPoll',
                        'poll',
                    )

                    .innerJoin(
                        'poll.post',
                        'post',
                    )

                    .leftJoin(
                        'option.votes',
                        'vote',
                    )

                    .addSelect(
                        'COUNT(DISTINCT vote.id)',
                        'voteCount',
                    )

                    .addSelect(
                        'poll.id',
                        'pollId',
                    )

                    .addSelect(
                        'post.id',
                        'postId',
                    )

                    .where(
                        'post.id IN (:...postIds)',
                        {
                            postIds,
                        },
                    )

                    .groupBy('option.id')
                    .addGroupBy('poll.id')
                    .addGroupBy('post.id')

                    .orderBy(
                        'option.position',
                        'ASC',
                    )

                    .getRawAndEntities()

                : {
                    entities: [],
                    raw: [],
                };



        // User Poll Votes
        const userVotes =
            postIds.length
                ? await this
                    .postPollVoteRepository
                    .find({
                        where: {
                            user: {
                                id: userId,
                            },
                            poll: {
                                post: {
                                    id: In(postIds),
                                },
                            },
                        },
                        relations: {
                            option: true,
                            poll: true,
                        },
                    })

                : [];

        const votedOptionByPoll =
            new Map(
                userVotes.map(
                    vote => [
                        vote.poll.id,
                        vote.option.id,
                    ],
                ),
            );


        const pollByPost =
            new Map<
                string,
                PollResult
            >();

        pollsRaw.entities.forEach(
            (option, index) => {

                const rawPoll =
                    pollsRaw.raw[index];

                const postId =
                    rawPoll.postId;

                const pollId =
                    rawPoll.pollId;

                const existing: PollResult =
                    pollByPost.get(postId)
                    ?? {
                        id: pollId,
                        options: [],
                    };

                existing.options.push({
                    id: option.id,
                    text: option.text,
                    position: option.position,
                    voteCount:
                        Number(
                            rawPoll.voteCount,
                        ),
                    isSelected:
                        votedOptionByPoll.get(
                            pollId,
                        ) === option.id,
                });

                pollByPost.set(
                    postId,
                    existing,
                );
            },
        );


        const transformedPosts =
            entities.map((postSave, index) => {

                const post = postSave.post;

                const postAttachments =
                    attachmentsByPost.get(post.id) ?? [];

                return {
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    type: post.type,
                    createdAt: post.createdAt,

                    author: {
                        id: post.user.id,
                        name: `${post.user.profile.firstName} ${post.user.profile.lastName}`,
                        exam: post.user.profile.exam?.name ?? null,
                    },

                    helpfulCount:
                        Number(raw[index].helpfulCount),

                    replyCount:
                        Number(raw[index].replyCount),

                    isSaved:
                        raw[index].isSaved === true ||
                        raw[index].isSaved === 'true',

                    isHelpful:
                        raw[index].isHelpful === true ||
                        raw[index].isHelpful === 'true',

                    hashtags:
                        hashtagsByPost.get(post.id) ?? [],

                    poll:
                        pollByPost.get(post.id) ?? null,

                    attachments:
                        postAttachments.map(
                            attachment => ({
                                id: attachment.id,
                                type: attachment.type,
                                fileName: attachment.fileName,
                                mimeType: attachment.mimeType,
                                fileSize: attachment.fileSize,
                                url: attachment.url,
                            }),
                        ),
                };
            });


        const total =
            await this.postSaveRepository.count({
                where: {
                    user: {
                        id: userId,
                    },

                    post: {
                        type: PostType.POST,
                        isDeleted: false,
                    },
                },
            });

        return {
            data: {
                posts: transformedPosts,
            },

            pagination: {
                page,
                limit,
                total,
                totalPages:
                    Math.ceil(
                        total / limit,
                    ),
            },
        };
    }

    async getMyQuestions( userId: string, query: PaginationQueryDto ) {
        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const queryBuilder = this.postRepository
            .createQueryBuilder('post')

            .leftJoinAndSelect('post.user', 'user')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('profile.exam', 'exam')

            .leftJoin(
                'post.reactions',
                'reaction',
                'reaction.type = :reactionType',
                {
                    reactionType: ReactionType.HELPFUL,
                },
            )

            .leftJoin(
                'post.answers',
                'answer',
                'answer.isDeleted = :isDeleted',
                {
                    isDeleted: false,
                },
            )

            .where('post.isDeleted = :isDeleted', {
                isDeleted: false,
            })

            .andWhere('post.type = :type', {
                type: PostType.QUESTION,
            })

            // Only questions created by current user
            .andWhere('user.id = :userId', {
                userId,
            })

            .addSelect(
                'COUNT(DISTINCT reaction.id)',
                'upvoteCount',
            )

            .addSelect(
                'COUNT(DISTINCT answer.id)',
                'answerCount',
            )

            .addSelect(
                `
            EXISTS (
                SELECT 1
                FROM post_reactions user_reaction
                WHERE user_reaction."postId" = post.id
                AND user_reaction."userId" = :userId
                AND user_reaction.type = :reactionType
            )
            `,
                'isUpvoted',
            )

            .addSelect(
                `
            EXISTS (
                SELECT 1
                FROM post_saves user_save
                WHERE user_save."postId" = post.id
                AND user_save."userId" = :userId
            )
            `,
                'isSaved',
            )

            .addSelect(
                `
            EXISTS (
                SELECT 1
                FROM question_answers qa
                WHERE qa."postId" = post.id
                AND qa."isAccepted" = true
            )
            `,
                'hasAcceptedAnswer',
            )

            .setParameter('userId', userId)
            .setParameter(
                'reactionType',
                ReactionType.HELPFUL,
            )

            .orderBy('post.createdAt', 'DESC')

            .groupBy('post.id')
            .addGroupBy('user.id')
            .addGroupBy('profile.id')
            .addGroupBy('exam.id')

            .skip(skip)
            .take(limit);

        const { entities, raw } =
            await queryBuilder.getRawAndEntities();

        const postIds = entities.map(
            (post) => post.id,
        );


        // Hashtags
        const postsWithHashtags = postIds.length
            ? await this.postRepository.find({
                where: {
                    id: In(postIds),
                },
                relations: {
                    hashtags: true,
                },
            })
            : [];

        const hashtagsByPost = new Map(
            postsWithHashtags.map((post) => [
                post.id,
                post.hashtags.map((hashtag) => ({
                    id: hashtag.id,
                    name: hashtag.name,
                })),
            ]),
        );

        const transformedQuestions = entities.map(
            (post, index) => ({
                id: post.id,
                title: post.title,
                content: post.content,
                type: post.type,
                createdAt: post.createdAt,

                author: {
                    id: post.user.id,
                    name: `${post.user.profile.firstName} ${post.user.profile.lastName}`,
                    exam:
                        post.user.profile.exam?.name ??
                        null,
                },

                upvoteCount:
                    Number(raw[index].upvoteCount),

                isUpvoted:
                    raw[index].isUpvoted === true ||
                    raw[index].isUpvoted === 'true',

                isSaved:
                    raw[index].isSaved === true ||
                    raw[index].isSaved === 'true',

                answerCount:
                    Number(raw[index].answerCount),

                hasAcceptedAnswer:
                    raw[index].hasAcceptedAnswer === true ||
                    raw[index].hasAcceptedAnswer === 'true',

                hashtags:
                    hashtagsByPost.get(post.id) ?? [],
            }),
        );


        const total =
            await this.postRepository.count({
                where: {
                    user: {
                        id: userId,
                    },
                    isDeleted: false,
                    type: PostType.QUESTION,
                },
            });

        return {
            data: {
                questions: transformedQuestions,
            },

            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(
                    total / limit,
                ),
            },
        };
    }

    async getMySavedQuestions( userId: string, query: PaginationQueryDto ) {

        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const queryBuilder = this.postSaveRepository
            .createQueryBuilder('postSave')

            .innerJoinAndSelect(
                'postSave.post',
                'post',
            )

            .leftJoinAndSelect(
                'post.user',
                'user',
            )

            .leftJoinAndSelect(
                'user.profile',
                'profile',
            )

            .leftJoinAndSelect(
                'profile.exam',
                'exam',
            )

            .leftJoin(
                'post.reactions',
                'reaction',
                'reaction.type = :reactionType',
                {
                    reactionType: ReactionType.HELPFUL,
                },
            )

            .leftJoin(
                'post.answers',
                'answer',
                'answer.isDeleted = :isDeleted',
                {
                    isDeleted: false,
                },
            )

            .where(
                'postSave.user.id = :userId',
                {
                    userId,
                },
            )

            .andWhere(
                'post.isDeleted = :isDeleted',
                {
                    isDeleted: false,
                },
            )

            .andWhere(
                'post.type = :type',
                {
                    type: PostType.QUESTION,
                },
            )

            .addSelect(
                'COUNT(DISTINCT reaction.id)',
                'upvoteCount',
            )

            .addSelect(
                'COUNT(DISTINCT answer.id)',
                'answerCount',
            )

            .addSelect(
                `
            EXISTS (
                SELECT 1
                FROM post_reactions user_reaction
                WHERE user_reaction."postId" = post.id
                    AND user_reaction."userId" = :userId
                    AND user_reaction.type = :reactionType
            )
            `,
                'isUpvoted',
            )

            .addSelect(
                `
            EXISTS (
                SELECT 1
                FROM post_saves user_save
                WHERE user_save."postId" = post.id
                    AND user_save."userId" = :userId
            )
            `,
                'isSaved',
            )

            .addSelect(
                `
            EXISTS (
                SELECT 1
                FROM question_answers qa
                WHERE qa."postId" = post.id
                    AND qa."isAccepted" = true
            )
            `,
                'hasAcceptedAnswer',
            )

            .setParameter(
                'userId',
                userId,
            )

            .setParameter(
                'reactionType',
                ReactionType.HELPFUL,
            )

            .orderBy(
                'postSave.createdAt',
                'DESC',
            )

            .groupBy(
                'post.id',
            )

            .addGroupBy(
                'postSave.id',
            )

            .addGroupBy(
                'postSave.createdAt',
            )

            .addGroupBy(
                'user.id',
            )

            .addGroupBy(
                'profile.id',
            )

            .addGroupBy(
                'exam.id',
            )

            .skip(skip)
            .take(limit);

        const {
            entities,
            raw,
        } = await queryBuilder.getRawAndEntities();


        // Hashtags
        const postIds =
            entities.map(
                postSave => postSave.post.id,
            );

        const postsWithHashtags =
            postIds.length
                ? await this.postRepository.find({
                    where: {
                        id: In(postIds),
                    },
                    relations: {
                        hashtags: true,
                    },
                })
                : [];

        const hashtagsByPost =
            new Map(
                postsWithHashtags.map(
                    post => [
                        post.id,
                        post.hashtags.map(
                            hashtag => ({
                                id: hashtag.id,
                                name: hashtag.name,
                            }),
                        ),
                    ],
                ),
            );


        const transformedQuestions =
            entities.map(
                (postSave, index) => {

                    const post =
                        postSave.post;

                    return {
                        id: post.id,

                        title:
                            post.title,

                        content:
                            post.content,

                        type:
                            post.type,

                        createdAt:
                            post.createdAt,

                        author: {
                            id:
                                post.user.id,

                            name:
                                `${post.user.profile.firstName} ${post.user.profile.lastName}`,

                            exam:
                                post.user.profile.exam
                                    ?.name ?? null,
                        },

                        upvoteCount:
                            Number(
                                raw[index].upvoteCount,
                            ),

                        isUpvoted:
                            raw[index].isUpvoted === true ||
                            raw[index].isUpvoted === 'true',

                        isSaved:
                            raw[index].isSaved === true ||
                            raw[index].isSaved === 'true',

                        answerCount:
                            Number(
                                raw[index].answerCount,
                            ),

                        hasAcceptedAnswer:
                            raw[index].hasAcceptedAnswer === true ||
                            raw[index].hasAcceptedAnswer === 'true',

                        hashtags:
                            hashtagsByPost.get(
                                post.id,
                            ) ?? [],
                    };
                },
            );


        const total =
            await this.postSaveRepository.count({
                where: {
                    user: {
                        id: userId,
                    },

                    post: {
                        type: PostType.QUESTION,
                        isDeleted: false,
                    },
                },
            });

        return {
            data: {
                questions:
                    transformedQuestions,
            },

            pagination: {
                page,
                limit,
                total,
                totalPages:
                    Math.ceil(
                        total / limit,
                    ),
            },
        };
    }

    async createAvatarUpload(userId: string, dto: CreateAvatarUploadDto) {

        const { fileName, fileSize, mimeType } = dto;

        const uploadId = randomUUID();

        const storagePath = `temp/${userId}/${uploadId}${fileName}`;

        const signedUpload = await this.supabaseStorageService.createUploadUrl('avatars', storagePath);

        const upload = this.avatarUploadRepository.create({
            id: uploadId,
            userId,
            fileName,
            mimeType,
            fileSize,
            storagePath
        });

        await this.avatarUploadRepository.save(upload);

        return {
            data: {
                uploadId,
                storagePath,
                uploadUrl: signedUpload.signedUrl,
            },
        };

    }

    async confirmAvatarUpload(userId: string, dto: ConfirmAvatarUploadDto) {
        const upload =
            await this.avatarUploadRepository.findOne({
                where: {
                    id: dto.uploadId,
                    userId,
                    isUsed: false,
                },
            });

        if (!upload) {
            throw new BadRequestException(
                'Invalid or already used avatar upload',
            );
        }

        const profile =
            await this.profileRepository.findOne({
                where: {
                    user: {
                        id: userId,
                    },
                },
            });

        if (!profile) {
            throw new NotFoundException(
                USER_MESSAGES.USER_PROFILE_NOT_FOUND,
            );
        }

        const avatarUrl =
            await this.supabaseStorageService.createPublicUrl(
                'avatars',
                upload.storagePath,
            );

        profile.avatar = avatarUrl;

        upload.isUsed = true;

        await this.dataSource.transaction(async (manager) => {
            await manager.save(profile);
            await manager.save(upload);
        });

        return {
            data: {
                avatar: avatarUrl,
            },
        };
    }

}
