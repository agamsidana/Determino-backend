import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "src/modules/user/user.service";
import { USER_MESSAGES } from "src/shared/constants/messages/user.messages";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService
    ) {

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') as string
        });
    }

    async validate(payload: JwtPayload) {

        const user = await this.userService.findUserWithProfileById(payload.sub);

        if (!user) {
            throw new UnauthorizedException(USER_MESSAGES.USER_NOT_FOUND);
        }

        return user;

    }

}