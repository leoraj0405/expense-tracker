import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.jwt;

    if (!token) {
      throw new UnauthorizedException('Token missing');
    }
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('SEMETRIC_KEY'),
      });
      req['user'] = decoded;
      const newToken = this.jwtService.sign(
        { id: decoded.id, email: decoded.email },
        {
          secret: this.configService.get<string>('SEMETRIC_KEY'),
          expiresIn: '30m',
        },
      );

      res.cookie('jwt', newToken, {
        httpOnly: true,
        secure: false, 
        sameSite: 'strict',
        maxAge: 30 * 60 * 1000, // 30 mins
      });

      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
