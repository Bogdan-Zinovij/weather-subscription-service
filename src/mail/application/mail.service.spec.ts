import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('MailService', () => {
  let service: MailService;
  let mailerService: MailerService;

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: mockMailerService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call mailerService.sendMail with correct parameters', async () => {
    const testData = {
      receiverEmail: 'user@example.com',
      subject: 'Test Subject',
      html: '<p>Hello world</p>',
    };

    mockMailerService.sendMail.mockResolvedValueOnce(undefined);

    await service.sendMail(testData);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: testData.receiverEmail,
      subject: testData.subject,
      html: testData.html,
    });
  });

  it('should throw if mailerService.sendMail fails', async () => {
    const testData = {
      receiverEmail: 'fail@example.com',
      subject: 'Error',
      html: '<p>Error</p>',
    };

    mockMailerService.sendMail.mockRejectedValueOnce(new Error('Send failed'));

    await expect(service.sendMail(testData)).rejects.toThrow('Send failed');
  });
});
