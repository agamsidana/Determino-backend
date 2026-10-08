import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ThrottlerGuard,ThrottlerStorage } from "@nestjs/throttler";
import type { ThrottlerModuleOptions } from "@nestjs/throttler";
import { Reflector } from "@nestjs/core";
import * as jwt from 'jsonwebtoken';


@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {


    constructor(
        options: ThrottlerModuleOptions,
        storageService: ThrottlerStorage,
        reflactor: Reflector,
        private readonly configService: ConfigService
    ) {
        super(options, storageService, reflactor)
    }

    protected async getTracker(req: Record<string, any>): Promise<string> {

        const authHeader = req.headers?.authorization;

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.slice(7);

            try {
                const payload = jwt.verify(
                    token,
                    this.configService.getOrThrow<string>('JWT_SECRET'),
                ) as { sub: string };

                return `user-${payload.sub}`;
            } catch {
                console.log('error occured')
            }

        }

         return `ip-${req.ip}`;
    }
}