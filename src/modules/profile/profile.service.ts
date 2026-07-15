import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProfileEntity } from './entities/profile.entity';
import { EntityManager, Repository } from 'typeorm';
import { CreateProfileData } from './interfaces/create-profile-data.interface';

@Injectable()
export class ProfileService {

    constructor(@InjectRepository(ProfileEntity) private readonly profileRepository: Repository<ProfileEntity>) { }

    async createProfile(data: CreateProfileData, manager?: EntityManager) : Promise<ProfileEntity> {

        const repository = manager ? manager.getRepository(ProfileEntity) : this.profileRepository;

        const profile = repository.create(data);

        const savedProfile = await repository.save(profile);

        return savedProfile;

    }

}
