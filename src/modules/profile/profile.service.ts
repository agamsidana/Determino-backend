import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileEntity } from './entities/profile.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateProfileData } from './interfaces/create-profile-data.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { USER_MESSAGES } from 'src/shared/constants/messages/user.messages';
import { UserEntity } from '../user/entities/user.entity';
import { ExamService } from '../exam/exam.service';
import { OnboardingStep } from './enums/onboardingStep.enum';
import { OnboardingScreen } from './enums/onboardingScreen.enum';
import { GoalService } from '../goal/goal.service';
import { UpdateProfileResponseDto } from './dto/update-profile-response.dto';
import { UserService } from '../user/user.service';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { CreateAvatarUploadDto } from './dto/create-avatar-upload.dto';
import { AvatarUploadEntity } from './entities/avatar-upload.entity';
import { randomUUID } from 'crypto';
import { SupabaseStorageService } from 'src/shared/supabase/supabase-storage.service';
import { ConfirmAvatarUploadDto } from './dto/confirm-avatar-upload.dto';
import { StudySessionService } from '../study-session/study-session.service';
import { PostService } from '../post/post.service';
import { use } from 'passport';
import { ConnectionService } from '../connection/connection.service';

@Injectable()
export class ProfileService {

    constructor(@InjectRepository(ProfileEntity) private readonly profileRepository: Repository<ProfileEntity>, @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>, @InjectRepository(AvatarUploadEntity) private readonly avatarUploadRepository: Repository<AvatarUploadEntity>, private readonly examService: ExamService, private readonly goalService: GoalService, private readonly supabaseStorageService: SupabaseStorageService,private readonly studySessionService:StudySessionService,private readonly postService:PostService,private readonly connectionService:ConnectionService, private readonly dataSource: DataSource) { }

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
