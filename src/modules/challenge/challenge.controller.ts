import { Controller, Get, Param, Post } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';

@Controller('challenge')
export class ChallengeController {

    constructor(private readonly challengeService:ChallengeService){}

    @Get()
    async getChallenges(@CurrentUser() user:UserEntity){
        return await this.challengeService.getChallenges(user.id)
    }

    @Post(':challengeId/join')
    async joinChallenge(@Param('challengeId') challengeId:string,@CurrentUser() user:UserEntity){
        return await this.challengeService.joinChallenge(challengeId,user.id);
    }

}
