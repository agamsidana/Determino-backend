import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GoalEntity } from './entities/goal.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class GoalService {

    constructor(@InjectRepository(GoalEntity) private readonly goalRepository: Repository<GoalEntity>) { }

    async findAll() {
        const goals = await this.goalRepository.find({
            where: {
                isActive: true
            }
        });

        return goals;
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
