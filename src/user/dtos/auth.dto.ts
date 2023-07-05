import { UserType } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';


export class SignupDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @Matches(/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, {message: 'Please enter valid phone number'})
    phone: string;

    @IsEmail()
    email: string;

    @MinLength(5)
    password: string

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    productKey?: string
}

export class SigninDto {
    @IsEmail()
    email: string;
    password: string
}

export class GenerateProductKeyDto {
    @IsEmail()
    email: string;

    @IsEnum(UserType)
    userType: UserType
}