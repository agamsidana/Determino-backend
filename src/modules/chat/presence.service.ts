import { Injectable } from "@nestjs/common";

@Injectable()
export class PresenceService {

    private readonly connections = new Map<string, number>();

    userConnected(userId:string){

        const currentConnections = this.connections.get(userId) ?? 0;

        this.connections.set(
            userId,
            currentConnections+1
        )

        return currentConnections === 0;

    }

    userDisconnected(userId:string){

        const currentConnections = this.connections.get(userId) ?? 0;

        if(currentConnections <= 1){
            this.connections.delete(userId);
            return true;
        }

        this.connections.set(
            userId,
            currentConnections-1
        );

        return false;
    }

    isOnline(userId: string) {
        return this.connections.has(userId);
    }

}