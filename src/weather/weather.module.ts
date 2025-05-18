import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { WeatherController } from './infrastructure/weather.controller';
import { WeatherService } from './application/weather.service';
import { AppConfigService } from 'src/config/app-config.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [WeatherController],
  providers: [WeatherService, AppConfigService],
  exports: [WeatherService],
})
export class WeatherModule {}
