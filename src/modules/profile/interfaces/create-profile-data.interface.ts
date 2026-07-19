import { UserEntity } from "src/modules/user/entities/user.entity";

export interface CreateProfileData {
  firstName: string;
  lastName: string;
  user: UserEntity;
}