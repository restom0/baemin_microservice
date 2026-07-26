import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
@Injectable()
export class NotifyService {
  constructor(private configService: ConfigService) {}

  async sendMailInfoOrder(data: any) {
    const { email, full_name } = data;
    const configMail = this.createTransport();

    const infoMail = {
      from: this.configService.get('EMAIL'),
      to: email,
      subject: `Dat hang qua Baemin - ${full_name} - ${email}`,
      html: '<h1>Xac nhan don hang thanh cong</h1>',
    };

    await configMail.sendMail(infoMail);
    return { status: 200, message: 'Order email sent' };
  }
  async sendMailInfoShipping(data: any) {
    const { email, full_name } = data;
    const configMail = this.createTransport();

    const infoMail = {
      from: this.configService.get('EMAIL'),
      to: email,
      subject: `Dat hang qua Baemin - ${full_name} - ${email}`,
      html: '<h1>Don hang dang duoc giao</h1>',
    };

    await configMail.sendMail(infoMail);
    return { status: 200, message: 'Shipping email sent' };
  }

  private createTransport() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('EMAIL'),
        pass: this.configService.get('EMAIL_TOKEN'),
      },
    });
  }
}
