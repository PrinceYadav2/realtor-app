import { Injectable, ConflictException, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserType } from '@prisma/client'

interface SignupParams {
    email: string, 
    password: string;
    name: string;
    phone: string
}

interface SigninParams {
    email: string, 
    password: string;
}

@Injectable()
export class AuthService {
    constructor(private readonly prismaService: PrismaService) {

    }

    async signup({name, email, password, phone}: SignupParams, userType: UserType) {
        const userExists = await this.prismaService.user.findUnique({
            where: {
                email,
            }
        })

        if(userExists) {
            throw new ConflictException();
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.prismaService.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                userType
            }
        });

        return this.generateToken(name, user.id);
    }

    async signin({email, password}: SigninParams) {
        console.log(email)
        const user = await this.prismaService.user.findUnique({
            where: {
                email
            }
        })

        console.log(user)

        if(!user) {
            throw new HttpException('Please enter valid creds', 400);
        }

        const hashedPassword = user.password;

        const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);

        if(!isPasswordCorrect) {
            throw new HttpException('Please enter valid creds', 400);
        }

        return this.generateToken(user.name, user.id);

    }

    private generateToken(name: string, id: number) {
        return jwt.sign({
            name,
            id
        },process.env.JSON_TOKEN_KEY, {
            expiresIn: 3500000
        })
    }

    generateProductKey(email: string, userType: UserType) {
        const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;

        return bcrypt.hash(string,10);
    }
}
