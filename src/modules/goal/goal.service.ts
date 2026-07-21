import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GoalEntity } from './entities/goal.entity';
import { In, Repository } from 'typeorm';
import { GoalResponseDto } from './dto/goal-response.dto';

@Injectable()
export class GoalService {

    constructor(@InjectRepository(GoalEntity) private readonly goalRepository: Repository<GoalEntity>) { }

    async findAll(): Promise<GoalResponseDto> {
        const goals = await this.goalRepository.find({
            where: {
                isActive: true
            }
        });

        return {
            data: goals.map((goal) => ({
                id: goal.id,
                name: goal.name,
                icon: goal.icon,
                iconColor: goal.iconColor,
                isActive: goal.isActive,
            })),
        };
    }

    async findGoalsByIds(ids: string[]) {

        const goals = await this.goalRepository.find({
            where: {
                id: In(ids),
                isActive:true
            }
        });

        return goals;

    }

}
