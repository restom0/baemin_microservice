import * as nodemailer from 'nodemailer';
import { NotifyService } from './notify.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('NotifyService', () => {
  const sendMail = jest.fn();
  const configService = {
    get: jest.fn((key: string) =>
      key === 'EMAIL' ? 'baemin@example.com' : 'email-token',
    ),
  };
  let service: NotifyService;

  beforeEach(() => {
    jest.clearAllMocks();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });
    sendMail.mockResolvedValue({ accepted: ['user@example.com'] });
    service = new NotifyService(configService as any);
  });

  it('sends shipping emails through configured SMTP', async () => {
    await expect(
      service.sendMailInfoShipping({
        email: 'user@example.com',
        full_name: 'User Example',
      }),
    ).resolves.toEqual({ status: 200, message: 'Shipping email sent' });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'baemin@example.com',
        to: 'user@example.com',
      }),
    );
  });
});
