export interface CreateUserData {
  email: string;
  password: string;
  isEmailVerified:boolean;
  emailVerificationCode:string;
  emailVerificationCodeExpiresAt:Date

}
