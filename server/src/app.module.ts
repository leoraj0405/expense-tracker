import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USER', 'root'),
        password: config.get<string>('DB_PASSWORD', 'Root1234@'),
        database: config.get<string>('DB_NAME', 'expensestracker'),
        autoLoadEntities: true,
        synchronize: true,
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
        { path: 'api/user/parenthome/', method: RequestMethod.GET },
        { path: 'api/user/processotp', method: RequestMethod.POST },
        { path: 'api/user/parentgenerateotp', method: RequestMethod.POST },
        { path: 'api/user/parentproccessotp', method: RequestMethod.POST },
        { path: 'api/user/generateotp', method: RequestMethod.POST },
        { path: 'api/user/checkuser', method: RequestMethod.POST },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
