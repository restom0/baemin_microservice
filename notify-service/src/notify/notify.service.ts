import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
@Injectable()
export class NotifyService {
  constructor(private configService: ConfigService) {}
  sendMailInfoOrder(data: any) {
    let { email, full_name } = data;
    let configMail = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('EMAIL'),
        pass: this.configService.get('EMAIL_TOKEN'),
      },
    });

    let infoMail = {
      from: this.configService.get('EMAIL'),
      to: email,
      subject: `Đặt hàng qua Amazon - ${full_name} - ${email}`,
      html: '<h1> Xác nhận đợn hàng thành công </h1>',
    };

    configMail.sendMail(infoMail, (error) => error);
  }
  sendMailInfoShipping(data: any) {
    let { email, full_name } = data;
    let configMail = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('EMAIL'),
        pass: this.configService.get('EMAIL_TOKEN'),
      },
    });

    let infoMail = {
      from: this.configService.get('EMAIL'),
      to: email,
      subject: `Đặt hàng qua Amazon - ${full_name} - ${email}`,
      html: '<h1> Đặt hàng thành công </h1>',
    };

    configMail.sendMail(infoMail, (error) => error);
  }
}
