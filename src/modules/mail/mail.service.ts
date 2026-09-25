import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { configuration } from 'src/config/configuration';

@Injectable()
export class MailService {

    private readonly resend: Resend;

    constructor() {
        this.resend = new Resend(configuration().MAIL_KEY);
    }

   async sendVerificationEmail(to: string,code: string) {
        const { data, error } = await this.resend.emails.send({
            from: configuration().MAIL_FROM!,
            to,
            subject: 'Verify your Determino account',
            html: `
                <h2>Welcome to Determino 🎯</h2>

                <p>
                    Thanks for signing up.
                    Use the verification code below to verify your email.
                </p>

                <h1>${code}</h1>

                <p>
                    This code will expire in 10 minutes.
                </p>
            `,
        });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async sendPasswordResetEmail( to: string, code: string) {
    const { data, error } = await this.resend.emails.send({
        from: configuration().MAIL_FROM!,
        to,
        subject: 'Reset your Determino password',
        html: `
            <h2>Reset your Determino password 🔐</h2>

            <p>
                We received a request to reset your password.
            </p>

            <p>
                Use the verification code below:
            </p>

            <h1>${code}</h1>

            <p>
                This code will expire in 10 minutes.
            </p>

            <p>
                If you didn't request a password reset,
                you can safely ignore this email.
            </p>
        `,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

}


