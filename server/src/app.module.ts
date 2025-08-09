import {
  Inject,
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
    MongooseModule.forRoot('mongodb://localhost:27017/expenseTracker'),
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
        'user/login',
        'user/registration',
        'user/parenthome/',
        'user/processotp',
        'user/parentgenerateotp',
        'user/parentproccessotp',
        'user/generateotp',
        'user/checkuser'
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
