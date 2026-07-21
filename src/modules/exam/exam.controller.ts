import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ExamService } from './exam.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ExamResponseDto } from './dto/exam-response.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('exams')
export class ExamController {

    constructor(private examService: ExamService) { }

    @ApiQuery({
        name: 'search',
        required: false,
        type: String
    })
    @Get()
    async findAll(@Query('search') search: string): Promise<ExamResponseDto> {
        return await this.examService.findAll(search)
    }

    @Get('/popular')
    async findPopular(): Promise<ExamResponseDto> {
        return await this.examService.findPopular()
    }
}
