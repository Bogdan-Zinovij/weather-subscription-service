/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { SubscriptionService } from 'src/subscription/application/subscription.service';
import { CreateSubscriptionDto } from 'src/subscription/dtos/create-subscription.dto';
import { HTTP_ERROR_MESSAGES } from 'src/common/constants/http.constants';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { SubscriptionErrorCode } from 'src/subscription/constants/subscription.errors';
import { TokenErrorCode } from 'src/token/constants/token.errors';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(AnyFilesInterceptor())
  async subscribe(@Body() dto: CreateSubscriptionDto): Promise<void> {
    try {
      await this.subscriptionService.subscribe(dto);
    } catch (err) {
      switch (err.message) {
        case SubscriptionErrorCode.EMAIL_ALREADY_SUBSCRIBED:
          throw new ConflictException(
            HTTP_ERROR_MESSAGES.EMAIL_ALREADY_SUBSCRIBED,
          );
        default:
          throw new BadRequestException(HTTP_ERROR_MESSAGES.INVALID_INPUT);
      }
    }
  }

  @Get('confirm/:token')
  async confirm(@Param('token') token: string): Promise<void> {
    try {
      await this.subscriptionService.confirm(token);
    } catch (err) {
      switch (err.message) {
        case TokenErrorCode.INVALID_TOKEN:
          throw new BadRequestException(HTTP_ERROR_MESSAGES.INVALID_TOKEN);
        case TokenErrorCode.TOKEN_NOT_FOUND:
        case SubscriptionErrorCode.TOKEN_NOT_FOUND:
          throw new NotFoundException(HTTP_ERROR_MESSAGES.TOKEN_NOT_FOUND);
        default:
          throw new BadRequestException(HTTP_ERROR_MESSAGES.INVALID_INPUT);
      }
    }
  }

  @Get('unsubscribe/:token')
  @HttpCode(HttpStatus.OK)
  async unsubscribe(@Param('token') token: string): Promise<void> {
    try {
      await this.subscriptionService.unsubscribe(token);
    } catch (err) {
      switch (err.message) {
        case TokenErrorCode.INVALID_TOKEN:
          throw new BadRequestException(HTTP_ERROR_MESSAGES.INVALID_TOKEN);
        case TokenErrorCode.TOKEN_NOT_FOUND:
        case SubscriptionErrorCode.TOKEN_NOT_FOUND:
          throw new NotFoundException(HTTP_ERROR_MESSAGES.TOKEN_NOT_FOUND);
        default:
          throw new BadRequestException(HTTP_ERROR_MESSAGES.INVALID_INPUT);
      }
    }
  }
}
