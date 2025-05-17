import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

interface SendMailParams {
  receiverEmail: string;
  subject: string;
  text: string;
}

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail({
    receiverEmail,
    subject,
    text,
  }: SendMailParams): Promise<void> {
    await this.mailerService.sendMail({ to: receiverEmail, subject, text });
  }
}
