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

  it('builds the SMTP transport from EMAIL/EMAIL_TOKEN config', async () => {
    await service.sendMailInfoOrder({
      email: 'user@example.com',
      full_name: 'User Example',
    });

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: { user: 'baemin@example.com', pass: 'email-token' },
    });
  });

  it('sends order confirmation emails through configured SMTP', async () => {
    await expect(
      service.sendMailInfoOrder({
        email: 'user@example.com',
        full_name: 'User Example',
      }),
    ).resolves.toEqual({ status: 200, message: 'Order email sent' });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'baemin@example.com',
        to: 'user@example.com',
        subject: 'Dat hang qua Baemin - User Example - user@example.com',
        html: '<h1>Xac nhan don hang thanh cong</h1>',
      }),
    );
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
        html: '<h1>Don hang dang duoc giao</h1>',
      }),
    );
  });
});
