import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PaginationLibsService } from './pagination_libs/pagination_libs.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ClientProxy } from '@nestjs/microservices';
import { RpcException } from '@nestjs/microservices/exceptions';


@Injectable()
export class AppService {
  constructor(
    private prismaService: PrismaService,
    private readonly paginationService: PaginationLibsService,
    private elasticService: ElasticsearchService,
    @Inject("NOTIFY_NAME") private notifyService:ClientProxy
  ) {}

  async findAll(
    page: number,
    limit: number,
    isTopDeal?: string,
    name_product?: string,
  ) {
    try {
      // Chuyển đổi dữ liệu query từ string sang kiểu thích hợp
      const currentPage = Number(page) || 1;
      const pageSize = Number(limit) || 10;
      const skip = (currentPage - 1) * pageSize;
  
      // Tạo điều kiện truy vấn với Prisma
      const where: any = {};
  
      if (isTopDeal !== undefined) {
        where.isTopDeal = isTopDeal === 'true'; // Chuyển thành boolean
      }
  
      if (name_product) {
        where.name = { contains: name_product, mode: 'insensitive' }; // Tìm kiếm không phân biệt hoa thường
      }
  
      // Truy vấn danh sách món ăn, lấy toàn bộ trường của bảng food + address từ eatery
      const products = await this.prismaService.products.findMany({
        where,
        select: {
          product_id: true,
          image: true,
          name: true ,
          title: true ,
          price: true ,
          star: true ,
          isTopDeal: true ,
          isAuthentic: true ,
          sale_percent: true ,
          shipping_type: true ,
          shipping_date: true ,
          isGlobal: true ,
          madeIn: true,
          shop_id: true,
          category_id: true,
          shops: {
            select: {
              logo: true, // Lấy hình ảnh từ bảng shops
            },
          },
        },
        orderBy: { product_id: 'desc' },
        skip,
        take: pageSize,
      });
  
      // Định dạng dữ liệu đầu ra
      const formattedProducts = products.map((product) => ({
        ...products, // Giữ nguyên toàn bộ thông tin của food
        logo: product.shops.logo, // Thêm địa chỉ vào kết quả
        shops: undefined, // Xóa key `eatery` thừa trong dữ liệu trả về
      }));
  
      // Gọi PaginationService để lấy thông tin phân trang
      const paginationMeta = await this.paginationService.paginate(
        this.prismaService.products, // Model Prisma
        currentPage,
        pageSize,
        where,
      );
  
      return {
        status: 'success',
        filters: {
          isTopDeal: isTopDeal || null,
          limit: pageSize,
        },
        data: {
          docs: formattedProducts,
          pages: paginationMeta,
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async saveProduct(data){
    try {
      // console.log(data);
      
      await this.prismaService.products.create({
        data,
      });
  
      return {
        message: 'Tạo sản phẩm thành công',
      };
    } catch (error) {
      console.error('❌ Lỗi khi tạo sản phẩm:', error.message || error);
  
      // Tuỳ vào logic, bạn có thể trả về lỗi hoặc ném ra RpcException
      // Ví dụ: ném lỗi để api_gateway rollback ảnh hoặc xử lý tiếp
      throw new RpcException({
        statusCode: 400,
        message: 'Tạo sản phẩm thất bại',
        detail: error.message,
      });
    }
  }
  async saveShop(data){
    // console.log(data);
    
    const { shop_name, email, phone } = data;
    //lỗi 400 || 500 => email, phone, shop_name đã tồn tại
    let checkAccount = await this.prismaService.shops.findFirst({
      where: {
        OR: [
          { email },
          { phone },
          { shop_name }
        ]
      }
    });
    // Nếu tìm thấy email, phone, shop Name trả về lỗi 400
    if (checkAccount) {
      throw new RpcException(
        {
          statusCode: 400,
          message: 'Shop name/Email/Phone đã tồn tại',
        }
      );
    };

    // nếu email và password đúng, lưu vào database
    await this.prismaService.shops.create({
      data
    })

    //gửi email thông báo đăng ký thành công
    this.notifyService.emit("send_mail_signUp_shop_success", {email})

    return {
      message: "Đăng ký shop thành công",
    };
  }
  async findShop(data) {
    const {shop_id, official} = data;
    const query: any = { shop_id };

    // Nếu featured được truyền vào, kiểm tra và thêm vào query
    if (official !== undefined) {
        query.official = official === 'true'; // Chuyển đổi chuỗi "true" thành boolean
    }

    // Thực hiện truy vấn trong Prisma
    const shops = await this.prismaService.shops.findMany({
        where: query, // Áp dụng bộ lọc eatery_id và featured (nếu có)
    });

    return {
        status: 'success',
        filters: {
            shop_id,
            official: official !== undefined ? query.official : undefined,
        },
        data: {
            docs: shops,
        },
    };
}

async findCategory(category_id: number) {
  const query: any = { category_id };

  // Thực hiện truy vấn trong Prisma
  const categories = await this.prismaService.categories.findMany({
      where: query, // Áp dụng bộ lọc category_id và featured (nếu có)
  });

  return {
      status: 'success',
      filters: {
          category_id,
      },
      data: {
          docs: categories,
      },
  };
}

async findFood(name: string) {
    let result = await this.elasticService.search({
      index: "product-tiki-index",
      query:{
        match:{
          name: name
        }
      }
    })
    return result;
    // const foods = await this.prismaService.food.findMany({
    //   where:{
    //     name_food:{
    //       contains: name //LIKE '%name%'
    //     }
    //   },
    //   select: {
    //     food_id: true,
    //     thumbnail: true,
    //     description: true,
    //     name_food: true,
    //     price: true,
    //     inventory: true,
    //     featured: true,
    //     promotion: true,
    //     kind: true,
    //     eatery_id: true,
    //     category_id: true,
    //     eatery: {
    //       select: {
    //         address: true, // Lấy địa chỉ từ bảng eatery
    //       },
    //     },
    //   },
    // });
    // // Định dạng dữ liệu đầu ra
    // const formattedFoods = foods.map((food) => ({
    //   ...food, // Giữ nguyên toàn bộ thông tin của food
    //   address: food.eatery.address, // Thêm địa chỉ vào kết quả
    //   eatery: undefined, // Xóa key `eatery` thừa trong dữ liệu trả về
    // }));
    // return formattedFoods;
  }

}
