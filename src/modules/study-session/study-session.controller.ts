import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { StudySessionService } from './study-session.service';
import { StartSessionDto } from './dto/start-session.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentStudySessionResponseDto, StartStudySessionResponseDto, StudySessionStatusResponseDto } from './dto/study-session-response.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('study-session')
export class StudySessionController {

    constructor(private readonly studySessionService:StudySessionService){}

    @Post('/start')
    async startSession(@Body() dto:StartSessionDto,@CurrentUser() user:UserEntity): Promise<StartStudySessionResponseDto>{
        return await this.studySessionService.startSession(dto,user.id);
    }

    @Get('/current')
    async getCurrentSession(@CurrentUser() user:UserEntity): Promise<CurrentStudySessionResponseDto>{
        return await this.studySessionService.getCurrentSession(user.id);
    }

    @Patch('/pause')
    async pauseSession(@CurrentUser() user:UserEntity): Promise<StudySessionStatusResponseDto>{
        return await this.studySessionService.pauseSession(user.id);
    }

    @Patch('/resume')
    async resumeSession(@CurrentUser() user:UserEntity): Promise<StudySessionStatusResponseDto>{
        return await this.studySessionService.resumeSession(user.id);
    }

    @Patch('/finish')
    async finishSession(@CurrentUser() user:UserEntity): Promise<StudySessionStatusResponseDto>{
        return await this.studySessionService.finishSession(user.id);
    }

}
