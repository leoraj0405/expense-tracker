import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('SEMETRIC_KEY') || 'fallbackSecret',
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') || '30m',
        },
      }),
    }),
  ],
  exports: [JwtModule],
})
export class AuthModule {}
