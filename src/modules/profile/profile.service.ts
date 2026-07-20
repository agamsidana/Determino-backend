import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileEntity } from './entities/profile.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateProfileData } from './interfaces/create-profile-data.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { USER_MESSAGES } from 'src/shared/constants/messages/user.messages';
import { UserEntity } from '../user/entities/user.entity';
import { ExamService } from '../exam/exam.service';
import { OnboardingStep } from './enums/onboardingStep.enum';
import { OnboardingScreen } from './enums/onboardingScreen.enum';
import { GoalService } from '../goal/goal.service';
import { UpdateProfileResponseDto } from './dto/update-profile-response.dto';

@Injectable()
export class ProfileService {

    constructor(@InjectRepository(ProfileEntity) private readonly profileRepository: Repository<ProfileEntity>, private readonly examService: ExamService, private readonly goalService: GoalService) { }

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
                throw new NotFoundException('one or more goals not found')
            }

            profile.goals = goals;

            profile.currentOnboardingStep = OnboardingStep.COMPLETED;
            profile.isOnboardingCompleted = true;
        }
    }

}
