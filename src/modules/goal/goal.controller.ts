import { Controller, Get, UseGuards } from '@nestjs/common';
import { GoalService } from './goal.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goal')
export class GoalController {

    constructor(private readonly goalService:GoalService){}

    @Get()
    async findAll(){
        return await this.goalService.findAll()
    }

}
