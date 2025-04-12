import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AppService {
  sendMailRegister(data) {
    let { email } = data;
    //gửi email thông báo đăng ký thành công
    const configMail = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hau.nguyenduc@gmail.com",
        pass: "aoezaeindzevhoxx"
      }
    })
    let infoMail = {
      from: "hau.nguyenduc@gmail.com",
      to: email,
      subject: "Đăng ký thành công",
      html: "<h1> Bạn đã đăng ký tài khoản Baemin thành công </h1>"
    }
    configMail.sendMail(infoMail, error => error);
  }
  sendMailOrder(data) {
    let { email } = data;
    //gửi email thông báo đặt Food thành công
    const configMail = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hau.nguyenduc@gmail.com",
        pass: "aoezaeindzevhoxx"
      }
    })
    let infoMail = {
      from: "hau.nguyenduc@gmail.com",
      to: email,
      subject: "Đặt hàng qua Tiki",
      html: "<h1> Xác nhận đơn hàng thành công </h1>"
    }
    configMail.sendMail(infoMail, error => error);
  }
  sendMailSuccess(data) {
    let { email } = data;
    //gửi email thông báo đã giao Food thành công
    const configMail = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hau.nguyenduc@gmail.com",
        pass: "aoezaeindzevhoxx"
      }
    })
    let infoMail = {
      from: "hau.nguyenduc@gmail.com",
      to: email,
      subject: "Giao hàng Tiki",
      html: "<h1 style='color:red'> Giao hàng thành công </h1>"
    }
    configMail.sendMail(infoMail, error => error);
  }
  sendMailShopSuccess(data) {
    let { email } = data;
    //gửi email thông báo đã giao Food thành công
    const configMail = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "hau.nguyenduc@gmail.com",
        pass: "aoezaeindzevhoxx"
      }
    })
    let infoMail = {
      from: "hau.nguyenduc@gmail.com",
      to: email,
      subject: "Đăng ký shop thành công",
      html: "<h1 style='color:red'> Đăng ký shop thành công </h1>"
    }
    configMail.sendMail(infoMail, error => error);
  }

}
