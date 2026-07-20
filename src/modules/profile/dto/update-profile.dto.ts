import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { Role } from "src/shared/enums/role.enum";
import { OnboardingScreen } from "../enums/onboardingScreen.enum";

export class UpdateProfileDto {

    @ApiProperty()
    @IsOptional()
    @IsEnum(Role)
    role!: Role;

    @ApiProperty()
    @IsOptional()
    @IsEnum(OnboardingScreen)
    screen!: OnboardingScreen;

    @ApiProperty()
    @IsString()
    @IsOptional()
    @IsUUID()
    examId!: string;

    @ApiProperty()
    @IsOptional()
    @IsArray()
    @IsUUID("4", { each: true })
    goalIds?: string[];


}