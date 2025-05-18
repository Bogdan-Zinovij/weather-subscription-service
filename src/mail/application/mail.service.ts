import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

interface SendMailParams {
  receiverEmail: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail({
    receiverEmail,
    subject,
    html,
  }: SendMailParams): Promise<void> {
    await this.mailerService.sendMail({ to: receiverEmail, subject, html });
  }
}
