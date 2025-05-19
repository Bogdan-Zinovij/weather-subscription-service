import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionFrequencyEnum } from 'src/common/enums/subscription-frequency.enum';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SubscriptionErrorCode } from 'src/subscription/constants/subscription.errors';
import { HTTP_ERROR_MESSAGES } from 'src/common/constants/http.constants';
import { SubscriptionService } from 'src/subscription/application/subscription.service';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let service: {
    subscribe: jest.Mock<Promise<void>, [any]>;
    confirm: jest.Mock<Promise<void>, [string]>;
    unsubscribe: jest.Mock<Promise<void>, [string]>;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        {
          provide: SubscriptionService,
          useValue: {
            subscribe: jest.fn(),
            confirm: jest.fn(),
            unsubscribe: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(SubscriptionController);
    service = module.get(SubscriptionService);
  });

  it('should call subscribe() without throwing', async () => {
    service.subscribe.mockResolvedValue(undefined);

    await expect(
      controller.subscribe({
        email: 'test@mail.com',
        city: 'Kyiv',
        frequency: SubscriptionFrequencyEnum.HOURLY,
      }),
    ).resolves.toBeUndefined();

    expect(service.subscribe).toHaveBeenCalled();
  });

  it('should call confirm() without throwing', async () => {
    service.confirm.mockResolvedValue(undefined);

    await expect(controller.confirm('token')).resolves.toBeUndefined();

    expect(service.confirm).toHaveBeenCalledWith('token');
  });

  it('should throw ConflictException if email already subscribed', async () => {
    service.subscribe.mockRejectedValue(
      new Error(SubscriptionErrorCode.EMAIL_ALREADY_SUBSCRIBED),
    );

    await expect(
      controller.subscribe({
        email: 'test@mail.com',
        city: 'Kyiv',
        frequency: SubscriptionFrequencyEnum.HOURLY,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should throw NotFoundException if token not found on confirm', async () => {
    service.confirm.mockRejectedValue(
      new Error(SubscriptionErrorCode.TOKEN_NOT_FOUND),
    );

    await expect(controller.confirm('badtoken')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should call unsubscribe()', async () => {
    await controller.unsubscribe('token');
    expect(service.unsubscribe).toHaveBeenCalledWith('token');
  });

  it('should throw NotFoundException if token not found on unsubscribe', async () => {
    service.unsubscribe.mockRejectedValue(
      new Error(SubscriptionErrorCode.TOKEN_NOT_FOUND),
    );

    await expect(controller.unsubscribe('badtoken')).rejects.toThrowError(
      new NotFoundException(HTTP_ERROR_MESSAGES.TOKEN_NOT_FOUND),
    );
  });
});
