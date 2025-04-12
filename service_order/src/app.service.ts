import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { RpcException } from '@nestjs/microservices';
import { error } from 'console';

@Injectable()
export class AppService {
  constructor(private prismaService:PrismaService,
   @Inject("LOGISTICS_NAME") private logisticsService: ClientProxy,
   @Inject("NOTIFY_NAME") private notifyService: ClientProxy,
  ){}
  async saveOrder(model) {
    try {
      const { customer_id, order_items } = model;
      // console.log(model);
  
      // Kiểm tra số lượng hàng tồn kho
      for (const item of order_items) {
        const product = await this.prismaService.products.findUnique({
          where: { product_id: item.product_id },
          select: { inventory: true },
        });
  
        if (!product || product.inventory < item.qty) {
          console.log("Xảy ra lỗi tồn kho!");
          throw new RpcException(`Sản phẩm ${item.product_id} không đủ hàng tồn kho`);
        }
      }
  
      // Tạo đơn hàng mới
      const created_at = new Date();
  
      let total_price2 = 0;
      for (const item of order_items) {
        const itemTotal = (item.price * (1 - item.sale_percent / 100)) * item.qty;
        total_price2 += itemTotal;
      }
  
      const newModel = {
        customer_id,
        total_price: total_price2,
        created_at
      };
  
      const newOrder = await this.prismaService.orders.create({
        data: newModel,
        select: { order_id: true },
      });
  
      // Tạo danh sách order items + trừ tồn kho
      const orderItemsPromises = order_items.map(async (item) => {
        const newItem = {
          order_id: newOrder.order_id,
          product_id: item.product_id,
          qty: item.qty,
          price: (item.price * (1 - item.sale_percent / 100))
        };
  
        await this.prismaService.orderItems.create({ data: newItem });
  
        await this.prismaService.products.update({
          where: { product_id: item.product_id },
          data: { inventory: { decrement: item.qty } },
        });
      });
  
      await Promise.all(orderItemsPromises);
  
      // Lấy thông tin khách hàng
      const customer = await this.prismaService.customers.findUnique({
        where: { customer_id },
        select: { email: true, phone: true, address: true, surname: true, name: true },
      });
  
      // Gửi email
      this.notifyService.emit("send_email_order", { email: customer.email });
  
      // Gửi dữ liệu sang logistics
      if (customer) {
        this.logisticsService.emit("save_logistic", {
          order_id: newOrder.order_id,
          status0: true,
          status1: false,
          status2: false,
          status3: false,
          status4: false,
          status5: false,
          status6: false,
          email: customer.email
        });
      }
  
      // Trả về kết quả
      return {
        message: "Order success",
        newOrder
      };
  
    } catch (error) {
      console.error("Lỗi trong quá trình xử lý đơn hàng:", error);
  
      // Nếu lỗi là RpcException thì ném lại, còn lại thì bọc vào RpcException
      if (error instanceof RpcException) {
        throw error;
      } else {
        throw new RpcException("Đã xảy ra lỗi khi xử lý đơn hàng");
      }
    }
    // let {
    //   customer_id, 
    //   order_items }= model;
    
    // console.log(model);
            
    // //kiểm tra số lượng hàng tồn kho
    //   for (const item of order_items) {
    //     const product = await this.prismaService.products.findUnique({
    //       where: { product_id: item.product_id },
    //       select: { inventory: true },
    //     });
      
    //     if (!product || product.inventory < item.qty) {
    //       console.log("xay ra Error!");
          
    //       throw new RpcException({
    //         statusCode: 401,
    //         message: `Sản phẩm ${item.product_id} không đủ hàng tồn kho`
    //       });
    //     }
    //   }

    // // Tạo đơn hàng mới
    // const created_at = new Date(); 

    // let total_price2 = 0;
    // for (const item of order_items) {
    //   const itemTotal = (item.price * (1 - item.sale_percent / 100)) * item.qty;
    //   total_price2 += itemTotal;
    // }
    
    // let newModel = {
    //   customer_id,
    //   total_price: total_price2,
    //   created_at
    // }

    // const newOrder = await this.prismaService.orders.create({
    //   data:newModel,
    //   select: { order_id: true }, // Chỉ lấy order_id sau khi tạo đơn hàng để dùng cho orderItems
    // });

    // // Tạo danh sách order items
    // const orderItemsPromises = order_items.map(async (item) => {
    //   const newItem = {
    //     order_id: newOrder.order_id,
    //     product_id: item.product_id,
    //     qty: item.qty,
    //     price: (item.price * (1 - item.sale_percent / 100))
    //   };
    
    //   await this.prismaService.orderItems.create({ data: newItem });
    
    //   // trừ tồn kho
    //   await this.prismaService.products.update({
    //     where: { product_id: item.product_id },
    //     data: { inventory: { decrement: item.qty } },
    //   });
    // });
    
    // await Promise.all(orderItemsPromises);
    
    // // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // //------------------------------------

    
    // // Lấy thông tin khách hàng từ bảng customer
    // const customer = await this.prismaService.customers.findUnique({
    //   where: { customer_id },
    //   select: { email: true, phone: true, address: true, surname: true, name: true },
    // });
    // //gọi service_notify để gửi email xác nhận đơn --> sendMailOrder(data)
    // this.notifyService.emit("send_email_order", { email:customer.email })
    // // gọi service_logistics để lưu dữ liệu vào bảng logistics
    // if (customer) {
    //   this.logisticsService.emit("save_logistic",{
    //         order_id: newOrder.order_id,
    //         status0: true,
    //         status1: false,
    //         status2: false, 
    //         status3: false,
    //         status4: false,
    //         status5: false,
    //         status6: false
    //   })
    // };

   
    // //------------------------------------
    // return {
    //   message: "Order success",
    //   newOrder
    // };
  }
}
