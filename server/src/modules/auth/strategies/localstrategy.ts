import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../dto/create-auth-dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super();
    }

    validate(loginDto: LoginDto) {
        const user = this.authService.loginUser(loginDto);
        if (!user) throw new UnauthorizedException();
        return user;
    }
}
