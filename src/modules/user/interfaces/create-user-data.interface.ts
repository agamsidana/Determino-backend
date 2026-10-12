export interface CreateUserData {
  email: string;
  password?: string;
  googleId?: string;
  isEmailVerified:boolean;
  emailVerificationCode?:string;
  emailVerificationCodeExpiresAt?:Date
}
