import { Transform, Type } from "class-transformer";
import {
    ArrayMinSize,
    ArrayUnique,
    IsArray,
    IsDateString,
    IsEmail,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    Min,
} from "class-validator";
import { RECRUITMENT_STATUSES, RecruitmentStatus } from "../recruitment-status";

export class CreateCandidateDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    phone: string;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(80)
    yearsOfExperience: number;

    @IsOptional()
    @IsString()
    recruiterNotes?: string;

    @IsIn(RECRUITMENT_STATUSES)
    recruitmentStatus: RecruitmentStatus;

    @IsDateString()
    consentAcceptedAt: string;

    @Transform(({ value }) => Array.isArray(value) ? value.map(Number) : value)
    @IsArray()
    @ArrayMinSize(1)
    @ArrayUnique()
    @IsInt({ each: true })
    @Min(1, { each: true })
    jobOfferIds: number[];
}