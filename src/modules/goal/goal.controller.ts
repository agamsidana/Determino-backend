import { Controller, Get, UseGuards } from '@nestjs/common';
import { GoalService } from './goal.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GoalResponseDto } from './dto/goal-response.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goal')
export class GoalController {

    constructor(private readonly goalService:GoalService){}

    @Get()
    async findAll(): Promise<GoalResponseDto>{
        return await this.goalService.findAll()
    }

}
