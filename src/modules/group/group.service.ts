import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupEntity } from './entities/group.entity';
import { Repository } from 'typeorm';
import { GroupMemberEntity } from './entities/group-member.entity';
import { DataSource } from 'typeorm/browser';
import { UserEntity } from '../user/entities/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupRole } from './enums/group-role.enum';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';

@Injectable()
export class GroupService {

    constructor(@InjectRepository(GroupEntity) private readonly groupRepository:Repository<GroupEntity>,@InjectRepository(GroupMemberEntity) private readonly groupMemberRepository:Repository<GroupMemberEntity>,private readonly dataSource:DataSource){}

    async createGroup(user:UserEntity,dto:CreateGroupDto){

        const {name,description} = dto;

        return this.dataSource.transaction(async (manager)=>{

            const group = manager.create(GroupEntity,{
                name,
                description,
                createdBy:{
                    id:user.id
                }
            });

            const savedGroup = await manager.save(group);

            const membership = manager.create(GroupMemberEntity,{
                role:GroupRole.ADMIN,
                group:{id:savedGroup.id},
                user:{id:user.id}
            });

            await manager.save(membership);

            return {
                data:{
                    id:savedGroup.id,
                    name:savedGroup.name,
                    description:savedGroup.description ?? null,
                    createdAt:savedGroup.createdAt,
                    memberCount: 1,
                    isJoined:true,
                    myRole:GroupRole.ADMIN

                }
            }

        });

    }

    async getGroups(userId:string,query:PaginationQueryDto){

        const {page,limit} = query;
        const skip = (page-1) * limit;

        const queryBuilder = this.groupRepository
                              .createQueryBuilder('group')

                              .leftJoin('group.members','member')

                              .where('group.isDeleted = :isDeleted',{isDeleted:false})

                              .addSelect('COUNT(DISTINCT member.id)','memberCount')

                              .addSelect(
                                `
                                EXISTS (

                                SELECT 1 FROM group_members gm
                                WHERE gm."groupId" = "group".id
                                AND gm."userId" = :userId

                                )`,
                                'isJoined'
                              )

                              .addSelect(
                                `
                                (SELECT gm2.role FROM group_members gm2
                                   WHERE gm2."groupId" = "group".id
                                   AND gm2."userId" = :userId
                                )
                                `,
                                'myRole'
                              )

                              .setParameter('userId',userId)

                              .orderBy('group.createdAt','DESC')

                              .groupBy('group.id')

                              .skip(skip)
                              .take(limit)
        

        const {entities,raw} = await queryBuilder.getRawAndEntities();


        const transformedGroups = entities.map((group, idx) => ({
            id: group.id,
            name: group.name,
            description: group.description ?? null,
            createdAt: group.createdAt,
            memberCount: Number(raw[idx].memberCount),
            isJoined: raw[idx].isJoined === true || raw[idx].isJoined === 'true',
            myRole: raw[idx].myRole ?? null,
        }));

        const total = await this.groupRepository.count({ where: { isDeleted: false } });

        return {
            data:{
                groups:transformedGroups
            },
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        }
                              

    }




}
