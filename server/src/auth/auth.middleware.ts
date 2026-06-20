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
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token missing');
    }
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('SEMETRIC_KEY'),
      });
      req['user'] = decoded;
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
