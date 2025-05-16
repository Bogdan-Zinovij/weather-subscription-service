import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateSubscriptionDto } from '../dtos/create-subscription.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { SubscriptionService } from '../application/subscription.service';

@ApiTags('subscription')
@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to weather updates' })
  @ApiConsumes('multipart/form-data') // <-- ключ для form-data
  async subscribe(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionService.subscribe(dto);
  }

  @Get('confirm/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm email subscription' })
  @ApiParam({
    name: 'token',
    required: true,
    description: 'Confirmation token',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription confirmed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async confirm(@Param('token') token: string) {
    return this.subscriptionService.confirm(token);
  }

  @Get('unsubscribe/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsubscribe from weather updates' })
  @ApiParam({ name: 'token', required: true, description: 'Unsubscribe token' })
  @ApiResponse({ status: 200, description: 'Unsubscribed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  @ApiResponse({ status: 404, description: 'Token not found' })
  async unsubscribe(@Param('token') token: string) {
    await this.subscriptionService.unsubscribe(token);
    return { message: 'Unsubscribed successfully' };
  }
}
