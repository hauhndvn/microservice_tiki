import { HttpException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(private prismaService:PrismaService,
    private jwtService:JwtService,
    @Inject("NOTIFY_NAME") private notifyService:ClientProxy
  ){}

  async signUp(model){
    let { accountName, phone, address, email, password } = model;
   //lỗi 400 || 500 => email, phone, accountName đã tồn tại
   let checkAccount = await this.prismaService.customer.findFirst({
      where: {
        OR: [
          { email },
          { phone },
          { accountName }
        ]
      }
    });
    // Nếu tìm thấy email, phone, accountName trả về lỗi 400
    if (checkAccount) {
      throw new RpcException('Email/Phone/Username đã tồn tại');
    };
    
    // nếu email và password đúng, lưu vào database
    await this.prismaService.customer.create({
      data: model
    })
    
    //gửi email thông báo đăng ký thành công
    this.notifyService.emit("send_mail_signUp_success", {email})

    return {
      message: "Đăng ký thành công",
    };
  }
  async login(model){
    try {
      let { username, password } = model;
      // console.log(username,"---",password);
      
      //lỗi 400 || 500 => email, phone, accountName sai
      let checkAccount = await this.prismaService.customer.findFirst({
        where: {
          OR: [
            { email: username },
            { phone: username },
            { accountName: username }
          ]
        }
      });
      // console.log(checkAccount);
      
      // Nếu không tìm thấy email, trả về lỗi 400
      if (!checkAccount) {
        throw new RpcException('Email/Phone/Username không tồn tại');
    }
    
    // Kiểm tra mật khẩu
    if (checkAccount.password !== password) {
        throw new RpcException('Mật khẩu không đúng');
    }
      // nếu email và password đúng, tạo token
      //ở Express phải khai báo 3 tham số:
      //  payload, secret key, header
      //ở đây chỉ cần truyền 2 tham số
      let token = await this.jwtService.signAsync(
        //payload
        { email: checkAccount.email },
        //header, 
        // gõ fn+Ctrl+Space mới nhắc lệnh
        { expiresIn: "5d",        
          algorithm: "HS256",
          secret: "BI_MAT"
        });
        // console.log(token);
        return {
          message: "Đăng nhập thành công",
          token: token
        };
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        throw new RpcException('Đã có lỗi xảy ra');
      }
    // Trả về token
    
  }
  

  getHello(): string {
    return 'Hello World!';
  }
}
