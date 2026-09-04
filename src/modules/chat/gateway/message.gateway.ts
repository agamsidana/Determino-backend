import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { ConversationParticipantEntity } from "../entities/conversation-participant.entity";
import { Repository } from "typeorm";
import { ChatService } from "../chat.service";
import { UserEntity } from "src/modules/user/entities/user.entity";


@WebSocketGateway({ cors: true })
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server!: Server;

    private readonly logger = new Logger(MessageGateway.name);

    constructor(private readonly jwtService: JwtService, @InjectRepository(ConversationParticipantEntity)
    private readonly conversationParticipantRepository: Repository<ConversationParticipantEntity>, private readonly chatService: ChatService,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>) { }

    @SubscribeMessage('joinConversation')
    async handleJoinConversation(@ConnectedSocket() client: Socket, @MessageBody() conversationId: string) {

        const userId = client.data.user?.sub;

        const participant = await this.conversationParticipantRepository.findOne({
            where: {
                conversation: {
                    id: conversationId
                },
                user: {
                    id: userId
                }
            }
        });

        if (!participant) {
            this.logger.warn(`Socket ${client.id} denied join to conversation:${conversationId} — not a participant`);
            return;
        }

        client.join(`conversation:${conversationId}`);
        this.logger.log(`Socket ${client.id} joined room conversation:${conversationId}`);
    }

    @SubscribeMessage('sendMessage')
    async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string, content: string }) {

        const user = client.data?.user;
        const { conversationId, content } = data;

        try {
            const message = await this.chatService.sendMessage(
                conversationId,
                user,
                { content }
            );

            this.server.to(`conversation:${conversationId}`).emit('newMessage', message.data);
        }
        catch (err: any) {
            client.emit('sendMessageError', { message: err.message });
        }

    }

    @SubscribeMessage('typing')
    handleTyping(@ConnectedSocket() client:Socket,@MessageBody() data:{conversationId:string}){

        const user = client.data.user;

        client.to(`conversation:${data.conversationId}`).emit('userTyping',{
            userId:user.id,
            name:`${user.profile.firstName} ${user.profile.lastName}`
        })

    }

    @SubscribeMessage('deleteMessage')
    async handleMessageDeletion(@ConnectedSocket() client:Socket,@MessageBody() data:{
        conversationId:string,
        messageId:string
    } ){

        const user = client.data.user;

        try{

            const result = await this.chatService.deleteMessage(data.conversationId,data.messageId,user.id);
            this.server.to(`conversation:${data.conversationId}`).emit('messageDeleted',result.data)

        }
        catch(err:any){
            client.emit('deleteMessageError',{
                message:err.message
            });
        }

    }

    @SubscribeMessage('stopTyping')
    handleStopTyping(@ConnectedSocket() client:Socket,@MessageBody() data:{conversationId:string}){

        const user = client.data.user;

        client.to(`conversation:${data.conversationId}`).emit('userStoppedTyping',{
            userId:user.id
        })

    }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake?.auth.token;

            if (!token) {
                return client.disconnect();
            }

            const payload = await this.jwtService.verifyAsync(token);

            const user = await this.userRepository.findOne({
                where: {
                    id: payload.sub
                },
                relations: {
                    profile: true
                }
            });

            if (!user) {
                client.disconnect();
                return;
            }

            client.data.user = user;

            this.logger.log(
                `User ${payload.sub} connected with socket ${client.id}`,
            );
        }
        catch (err: any) {
            this.logger.warn(`Unauthorized socket: ${client.id}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

}