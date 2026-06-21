import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from './storage/storage.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { ExpenseModule } from './expense/expense.module';
import { GroupModule } from './group/group.module';
import { GroupExpenseModule } from './groupExpense/grpExpense.module';
import { GroupMemberModule } from './groupMember/grpMember.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthMiddleware } from './auth/auth.middleware';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        ssl: {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: true,
        },
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('SEMETRIC_KEY'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN'),
        },
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get<string>('EMAIL_HOST'),
          port: config.get<string>('EMAIL_PORT'),
          auth: {
            user: config.get<string>('EMAIL_AUTH_USER'),
            pass: config.get<string>('EMAIL_AUTH_PASS'),
          },
        },
      }),
    }),
    StorageModule,
    UserModule,
    CategoryModule,
    ExpenseModule,
    GroupModule,
    GroupExpenseModule,
    GroupMemberModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'api/user/login', method: RequestMethod.POST },
        { path: 'api/user', method: RequestMethod.POST },
        { path: 'api/user/processotp', method: RequestMethod.POST },
        { path: 'api/user/parentgenerateotp', method: RequestMethod.POST },
        { path: 'api/user/parentproccessotp', method: RequestMethod.POST },
        { path: 'api/user/generateotp', method: RequestMethod.POST },
        { path: 'api/user/checkuser', method: RequestMethod.POST },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
