import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/create-auth-dto';
import { localGuard } from './guards/local.guard';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('/')
export class AuthController {
    constructor(
        private authService: AuthService,
        private jwtService: JwtService,
    ) {}

    @Post('login')
    @UseGuards(localGuard)
    async LoginDto(@Res() res: Response, @Req() req: Request): Promise<any> {
        // const jwt = await this.authService.loginUser(loginDto);
        // res.setHeader('Authorization', 'Bearer ' + jwt);
        // return res.json(jwt);
        let token = req.user;
        await res.setHeader('Authorization', 'Bearer ' + token);
        res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, secure: true, sameSite: 'none' });

        return res.send({
            message: 'asdfasdfads',
        });
    }

    @Get('/main')
    @UseGuards(JwtAuthGuard)
    status(@Req() req: Request) {
        console.log('Inside AuthController status method');
        console.log(req.user);
        return req.user;
    }

    // @Get('/cookies')
    // getCookies(@Req() req: Request, @Res() res: Response) {
    //     console.log(req.cookies);
    //     const jwt = req.cookies['jwt'];
    //     return res.send(jwt);
    // }

    @Post('/logout')
    logout(@Res() res: Response, @Req() req: Request) {
        res.cookie('jwt', '', { maxAge: 0 });
        return res.send({ message: 'success' });
    }
}
