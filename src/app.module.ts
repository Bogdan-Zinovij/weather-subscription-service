import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WeatherModule } from './weather/weather.module';
import { DatabaseModule } from './database/database.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    WeatherModule,
    SubscriptionModule,
  ],
})
export class AppModule {}
