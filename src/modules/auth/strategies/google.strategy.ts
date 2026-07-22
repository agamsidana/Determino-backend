import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-google-oauth20';
import { Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {

    constructor(private readonly configService: ConfigService, private readonly authService: AuthService,) {
        super({
            clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
            clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
            scope: ['email', 'profile'],
        })
    }
    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile
    ) {

        return await this.authService.validateGoogleUser({
            googleId: profile.id,
            lastName: profile.name?.familyName ?? "",
            firstName: profile.name?.givenName ?? "",
            email: profile.emails?.[0]?.value ?? ""
        });

    }

}
