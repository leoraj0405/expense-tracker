import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface ParentJwtPayload {
  role: 'parent';
  parentEmail: string;
  childIds: string[];
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private isParentExpenseRead(req: Request, childIds: string[]): boolean {
    if (req.method !== 'GET') return false;
    const match = req.originalUrl.match(/\/api\/expense\/userexpense\/([^/?]+)/);
    if (!match) return false;
    return childIds.includes(match[1]);
  }

  private isParentHome(req: Request): boolean {
    return req.method === 'GET' && /\/api\/user\/parenthome\/?(\?|$)/.test(req.originalUrl);
  }

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('SEMETRIC_KEY'),
      }) as Record<string, unknown> & Partial<ParentJwtPayload>;

      if (decoded.role === 'parent') {
        const childIds = Array.isArray(decoded.childIds) ? decoded.childIds : [];
        req['parent'] = decoded;

        if (this.isParentHome(req) || this.isParentExpenseRead(req, childIds)) {
          return next();
        }

        throw new UnauthorizedException('Parent not allowed for this route');
      }

      req['user'] = decoded;
      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
