import { HttpException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { RpcException } from '@nestjs/microservices';
import { authorize } from 'passport';

@Injectable()
export class AppService {
  constructor(private prismaService:PrismaService,
    private jwtService:JwtService,
    @Inject("NOTIFY_NAME") private notifyService:ClientProxy
  ){}

  async signUp(model){
    try {
      let { accountName, phone, address, email, password } = model;
  
      // Kiểm tra email, phone, accountName đã tồn tại
      let checkAccount = await this.prismaService.customers.findFirst({
        where: {
          OR: [
            { email },
            { phone },
            { accountName }
          ]
        }
      });
  
      // Nếu tìm thấy trả về lỗi 400
      if (checkAccount) {
        throw new RpcException('Email/Phone/Username đã tồn tại');
      }
  
      // Lưu vào database
      await this.prismaService.customers.create({
        data: model
      });
  
      // Gửi email thông báo đăng ký thành công
      this.notifyService.emit("send_mail_signUp_success", { email });
  
      return {
        message: "Đăng ký thành công",
      };
  
    } catch (error) {
      console.error('Lỗi signUp:', error);
  
      // Nếu là RpcException rồi thì giữ nguyên, còn lỗi khác thì bọc lại
      if (error instanceof RpcException) {
        throw error;
      } else {
        throw new RpcException('Đăng ký customer thất bại');
      }
    }
  }
  async login(model){
    try {
      let { username } = model;
      // console.log(username,"---",password);
      
      //lỗi 400 || 500 => email, phone, accountName sai
      let checkAccount = await this.prismaService.customers.findFirst({
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
        throw new RpcException(
          {
            statusCode: 400,
            message: 'Email/Phone/Username không tồn tại',
          }
          );
    }
    
    // Kiểm tra mật khẩu
    if (checkAccount.password !== model.password) {
        throw new RpcException(
          {
            statusCode: 400,
            message: 'Mật khẩu không đúng',
          }
          );
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
        const { password, ...others} = checkAccount;
        return {
          message: "Đăng nhập customer thành công",
          customer: others,
          Authorization: `Bearer ${token}`
        };
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        // if (error instanceof RpcException) {
        //   return error.getError();  // <-- trả lại đúng object bạn throw
        // }
        // Nếu là RpcException rồi thì giữ nguyên, còn lỗi khác thì bọc lại (cách này mới chuẩn)
      if (error instanceof RpcException) {
        throw error;
      } else {
        throw new RpcException('Đăng nhập customer thất bại');
      }
      }
  }
  async logout(data: { customer_id: string }){
    let { customer_id } = data;
    return {
      message: `Customer ${customer_id} đăng xuất thành công`,
      Authorization: ""
    };
  }
//-------------------------------------------------
async loginShop(data){
  let { email, password } = data;
  let checkAccount = await this.prismaService.shops.findFirst({
    where: { email }
  });
  // console.log(checkAccount);
  
  // Nếu không tìm thấy email, trả về lỗi 400
  if (!checkAccount) {
    throw new RpcException(
      {
        statusCode: 400,
        message: 'Email không tồn tại',
      }
      );
}

// Kiểm tra mật khẩu
if (checkAccount.password !== password) {
    throw new RpcException(
      {
        statusCode: 400,
        message: 'Mật khẩu không đúng',
      }
      );
}
  let token = await this.jwtService.signAsync(
    { email: checkAccount.email },
    { expiresIn: "5d",        
      algorithm: "HS256",
      secret: "BI_MAT"
    });
    return {
      message: "Đăng nhập shops thành công",
      Authorization: `Bearer ${token}`
    };
} catch (error) {
    console.error("Lỗi đăng nhập:", error);
    // if (error instanceof RpcException) {
    //   return error.getError();  // <-- trả lại đúng object bạn throw
    // }
    if (error instanceof RpcException) {
      throw error;
    } else {
      throw new RpcException('Đăng nhập shop thất bại');
    }
  }
//-------------------------------------------------
  getHello(): string {
    return 'Hello World!';
  }
}
