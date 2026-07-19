import { Controller, Get, UseGuards } from '@nestjs/common';
import { ExamService } from './exam.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('exams')
export class ExamController {

    constructor(private examService:ExamService){}

    @Get()
    async findAll(){
        return await this.examService.findAll()
    }

    @Get('/popular')
    async findPopular(){
        return await this.examService.findPopular()
    }



}
