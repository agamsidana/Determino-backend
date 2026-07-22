import { AuthProvider } from "src/shared/enums/auth-provider.enum";

export interface CreateUserData {
    email: string;
    password?: string;
    googleId?: string;
    provider: AuthProvider;
}