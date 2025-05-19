import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MailerOptions } from '@nestjs-modules/mailer';

@Injectable()
export class AppConfigService {
  getPostgresConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: false,
      migrationsRun: true,
      migrations: ['dist/database/migrations/*.js'],
      logging: ['query', 'error', 'schema', 'warn'],
    };
  }

  getWeatherApiConfig() {
    const baseUrl = process.env.WEATHER_API_BASE_URL;
    const apiKey = process.env.WEATHER_API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error(
        'Missing WEATHER_API_BASE_URL or WEATHER_API_KEY in environment',
      );
    }

    return { baseUrl, apiKey };
  }

  getMailerConfig(): MailerOptions {
    return {
      transport: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      defaults: {
        from: `"${process.env.SMTP_SENDER_NAME ?? 'NoReply'}" <${process.env.SMTP_SENDER_EMAIL}>`,
      },
    };
  }
}
