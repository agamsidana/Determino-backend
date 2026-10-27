import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserData } from './interfaces/create-user-data.interface';

@Injectable()
export class UserService {

    constructor(@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>) { }

    async findUserById(id: string) {
        const user = await this.userRepository.findOneBy({ id });
        return user;
    }

    async findUserWithProfileById(id:string){
        const user = await this.userRepository.findOne({
            where:{
                id
            },
            relations:{
                profile:true
            }
        });

        return user;
    }

    async findUserByEmail(email: string) {
        const user = await this.userRepository.findOneBy({ email });
        return user;
    }

    async findUserForEmailVerification(
        email: string,
    ){
        return this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.profile','profile')
        .addSelect('user.emailVerificationCode')
        .addSelect('user.emailVerificationCodeExpiresAt')
        .where('user.email = :email', { email })
        .getOne();
    }

    async findUserForPasswordReset(
        email: string,
    ){
        return this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.passwordResetCode')
        .addSelect('user.passwordResetCodeExpiresAt')
        .where('user.email = :email', { email })
        .getOne();
    }

    async findUserByEmailWithCredentials(email:string){
        const user = this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .leftJoinAndSelect('user.profile', 'profile')
            .where('user.email=:email',{email})
            .getOne();

        return user;
    }
    
    async findUserByIdWithCredentials(userId:string){
        const user = this.userRepository
                     .createQueryBuilder('user')
                     .addSelect('user.password')
                     .where('user.id = :userId',{userId})
                     .getOne();
        return user;
    }

    async findUserByGoogleIdOrEmail(googleId:string,email:string){
        return this.userRepository.findOne({
            where:[{googleId},{email}],
            relations:{
                profile:true
            }
        });
    }

    async createUser(data:CreateUserData,manager?:EntityManager) : Promise<UserEntity> {

        const repository= manager ? manager.getRepository(UserEntity): this.userRepository

        const user = repository.create(data);

        const savedUser = await repository.save(user);

        return savedUser;

    }

    async saveUser(user: UserEntity): Promise<UserEntity> {
        return await this.userRepository.save(user);
    }

}
