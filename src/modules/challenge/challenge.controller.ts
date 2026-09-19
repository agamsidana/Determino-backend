import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SubmitQuizDto } from './dto/submit-quiz.dto';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('challenge')
export class ChallengeController {

    constructor(private readonly challengeService:ChallengeService){}

    @Get()
    async getChallenges(@CurrentUser() user:UserEntity){
        return await this.challengeService.getChallenges(user.id)
    }

    @Get(':challengeId/quiz')
    async getTodayQuiz(@Param('challengeId') challengeId:string,@CurrentUser() user:UserEntity){
        return await this.challengeService.getTodayQuiz(challengeId,user.id);
    }

    @Get('quiz/:quizId/result')
    async getQuizResult(@Param('quizId') quizId:string,@CurrentUser() user:UserEntity){
        return await this.challengeService.getQuizResult(quizId,user.id);
    }

    @Post(':challengeId/join')
    async joinChallenge(@Param('challengeId') challengeId:string,@CurrentUser() user:UserEntity){
        return await this.challengeService.joinChallenge(challengeId,user.id);
    }

    @Post('quiz/:quizId/submit')
    async submitQuiz(@Param('quizId') quizId:string,@CurrentUser() user:UserEntity,@Body() dto:SubmitQuizDto){
        return await this.challengeService.submitQuiz(quizId,user.id,dto);
    }

}
