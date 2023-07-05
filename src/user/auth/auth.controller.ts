import { Body, Controller, Param, Post, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserType } from '@prisma/client';

import { AuthService } from './auth.service';
import { SignupDto, SigninDto, GenerateProductKeyDto } from '../dtos/auth.dto';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {

    }

    @Post('signup/:userType')
    async signup(@Body() body: SignupDto, @Param('userType') userType: UserType) {
        if(userType !== UserType.BYHER) {
            if(!body.productKey) {
                throw new UnauthorizedException();
            }
            
            const validProductKey = `${body.email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
            const isValidProductKey = await bcrypt.compare(validProductKey, body.productKey);
            if (!isValidProductKey) {
                throw new UnauthorizedException();
            }
        }
        return await this.authService.signup(body, userType);
    }

    @Post('signin')
    async signin(@Body() body: SigninDto) {
        return await this.authService.signin(body);
    }

    @Post('key')
    generateProductKey(@Body() {email, userType}: GenerateProductKeyDto) {
        return this.authService.generateProductKey(email, userType)
    }
    
}
