import { Module } from '@nestjs/common';
import { MailService } from './application/mail.service';
import { AppConfigModule } from '../config/app-config.module';
import { AppConfigService } from '../config/app-config.service';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) =>
        configService.getMailerConfig(),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
