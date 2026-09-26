import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PrepMateConnectionEntity } from './entities/prepmate-connection.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { USER_MESSAGES } from 'src/shared/constants/messages/user.messages';
import { ConnectionStatus } from './enums/connection-status.enum';
import { UserEntity } from '../user/entities/user.entity';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';

@Injectable()
export class ConnectionService {

    constructor(@InjectRepository(PrepMateConnectionEntity) private readonly prepMateConnectionRepository:Repository<PrepMateConnectionEntity>,private readonly userService:UserService){}


    private getCanonicalPair( userId1: string,userId2: string ) {

        return userId1 < userId2
            ? {
                userLowId: userId1,
                userHighId: userId2,
            }
            : {
                userLowId: userId2,
                userHighId: userId1,
            };

    }

    async sendPrepMateRequest(receiverId: string, requesterId: string) {

        // 1. Prevent self-request
        if (receiverId === requesterId) {
            throw new BadRequestException('You cannot send a PrepMate request to yourself');
        }

        // 2. Make sure receiver exists
        const receiver = await this.userService.findUserById(receiverId);
        if (!receiver) {
            throw new NotFoundException(USER_MESSAGES.USER_NOT_FOUND);
        }

        // 3. Normalize the pair
        const { userLowId, userHighId } = this.getCanonicalPair(requesterId, receiverId);

        // 4. Check whether a relationship already exists
        const existingConnection = await this.prepMateConnectionRepository.findOne({
            where: {
                userLow: {
                    id: userLowId
                },
                userHigh: {
                    id: userHighId
                }
            }
        });

        // 5. Already pending
        if (existingConnection && existingConnection.status === ConnectionStatus.PENDING) {
            throw new BadRequestException('PrepMate request is already pending');
        }

        // 6. Already accepted
        if (existingConnection && existingConnection.status === ConnectionStatus.ACCEPTED) {
            throw new BadRequestException('You are already PrepMates');
        }

        // 7. Previously declined → resend
        if (existingConnection && existingConnection.status === ConnectionStatus.DECLINED) {
            existingConnection.status = ConnectionStatus.PENDING;
            existingConnection.requester = { id: requesterId } as UserEntity;
            existingConnection.receiver = { id: receiverId } as UserEntity;

            const updatedConnection = await this.prepMateConnectionRepository.save(existingConnection);

            return {
                data: {
                    id: updatedConnection.id,
                    status: updatedConnection.status,
                    requesterId,
                    receiverId,
                },
            };
        }

        // 8. No existing relationship → create new request
        const connection = this.prepMateConnectionRepository.create({
            userLow: { id: userLowId },
            userHigh: { id: userHighId },
            requester: { id: requesterId },
            receiver: { id: receiverId },
            status: ConnectionStatus.PENDING,
        });

        try {
            const savedConnection = await this.prepMateConnectionRepository.save(connection);

            return {
                data: {
                    id: savedConnection.id,
                    status: savedConnection.status,
                    requesterId,
                    receiverId,
                },
            };
        }
        catch (err: any) {
            if (
                err instanceof QueryFailedError &&
                err.driverError?.code === '23505'
            ) {
                throw new BadRequestException(
                    'A PrepMate relationship already exists between these users',
                );
            }

            throw err;
        }

    }

    async acceptPrepMateRequest(connectionId:string,userId:string){

        const connection = await this.prepMateConnectionRepository.findOne({
            where:{
                id:connectionId
            },
            relations:{
                requester:true,
                receiver:true
            }
        });
        if(!connection){
            throw new NotFoundException('PrepMate request not found');
        }

        if (connection.status !== ConnectionStatus.PENDING) {
            throw new BadRequestException('Only pending PrepMate requests can be accepted');
        }


        if (connection.receiver.id !== userId) {
            throw new ForbiddenException('You cannot accept this PrepMate request');
        }

        connection.status = ConnectionStatus.ACCEPTED;

        const updatedConnection = await this.prepMateConnectionRepository.save(connection);

        return {
            data: {
                id: updatedConnection.id,
                status: updatedConnection.status,
                requesterId: connection.requester.id,
                receiverId: connection.receiver.id,
            },
        };

    }

    async declinePrepMateRequest(connectionId:string,userId:string){

        const connection = await this.prepMateConnectionRepository.findOne({
            where:{
                id:connectionId
            },
            relations:{
                requester:true,
                receiver:true
            }
        });
        if(!connection){
            throw new NotFoundException('PrepMate request not found');
        }

        if (connection.status !== ConnectionStatus.PENDING) {
            throw new BadRequestException('Only pending PrepMate requests can be declined');
        }

        if (connection.receiver.id !== userId) {
            throw new ForbiddenException('You cannot decline this PrepMate request');
        }

        connection.status = ConnectionStatus.DECLINED;

        const updatedConnection = await this.prepMateConnectionRepository.save(connection);

        return {
            data: {
                id: updatedConnection.id,
                status: updatedConnection.status,
                requesterId: connection.requester.id,
                receiverId: connection.receiver.id,
            },
        };
    }

    async getPendingPrepMateRequests(userId: string, query: PaginationQueryDto) {

        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const [requests, total] = await this.prepMateConnectionRepository.findAndCount({
            where: {
                receiver: {
                    id: userId
                },
                status: ConnectionStatus.PENDING
            },
            relations: {
                requester: {
                    profile: true
                }
            },
            order: {
                createdAt: 'DESC'
            },
            skip,
            take: limit
        });

        const transformedResponse = requests.map((request) => ({
            connectionId: request.id,
            requester: {
                id: request.requester.id,
                name: `${request.requester.profile.firstName} ${request.requester.profile.lastName}`,
                avatar: request.requester.profile.avatar,
                role: request.requester.profile.role
            },
            createdAt: request.createdAt
        }));

        return {
            data: {
                requests: transformedResponse,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
            }
        }

    }

    async getMyPrepMates(userId: string, query: PaginationQueryDto) {

        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const [connections, total] = await this.prepMateConnectionRepository
            .createQueryBuilder('connection')
            .leftJoinAndSelect('connection.userLow', 'userLow')
            .leftJoinAndSelect('userLow.profile', 'userLowProfile')
            .leftJoinAndSelect('connection.userHigh', 'userHigh')
            .leftJoinAndSelect('userHigh.profile', 'userHighProfile')
            .where('connection.status = :status', {
                status: ConnectionStatus.ACCEPTED
            })
            .andWhere('(userLow.id = :userId  OR userHigh.id = :userId)', { userId })
            .orderBy('connection.updatedAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const prepMates = connections.map((connection) => {
            const isLowUser = connection.userLow.id === userId;

            const prepMate = isLowUser ? connection.userHigh : connection.userLow;
            return {
                connectionId: connection.id,
                user: {
                    id: prepMate.id,
                    name: `${prepMate.profile.firstName} ${prepMate.profile.lastName}`,
                    avatar: prepMate.profile.avatar,
                    role: prepMate.profile.role,
                },
                connectedAt: connection.updatedAt,
            };
        })

        return {
            data: {
                prepMates,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
        };


    }

    async cancelPrepMateRequest(userId: string, connectionId: string) {

        const connection = await this.prepMateConnectionRepository.findOne({
            where: {
                id: connectionId
            },
            relations: {
                requester: true
            }
        });

        if (!connection) {
            throw new NotFoundException('PrepMate request not found');
        }

        if (connection.status !== ConnectionStatus.PENDING) {
            throw new BadRequestException('Only pending PrepMate requests can be cancelled');
        }

        if (connection.requester.id !== userId) {
            throw new ForbiddenException('You cannot cancel this PrepMate request');
        }

        await this.prepMateConnectionRepository.remove(connection);

        return {
            data: {
                id: connection.id,
                message: 'PrepMate request cancelled successfully',
            },
        };




    }

}
