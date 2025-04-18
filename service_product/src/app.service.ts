import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { PaginationLibsService } from './pagination_libs/pagination_libs.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ClientProxy } from '@nestjs/microservices';
import { RpcException } from '@nestjs/microservices/exceptions';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AppService {
  constructor(
    private prismaService: PrismaService,
    private readonly paginationService: PaginationLibsService,
    private elasticService: ElasticsearchService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject("NOTIFY_NAME") private notifyService:ClientProxy
  ) {}

  async findAll(data) {
        try {
          const { page, limit, isTopDeal } = data;
          let dataCache = await this.cacheManager.get("get_all_product_tiki");
      
          // Nếu có cache → trả về luôn (lần 2)
          if (dataCache) {
            return dataCache;
          }
          
          // Nếu chưa có cache → lấy data
          
            // Chuyển đổi dữ liệu query từ string sang kiểu thích hợp
            const currentPage = Number(page) || 1;
            const pageSize = Number(limit) || 10;
            const skip = (currentPage - 1) * pageSize;
        
            // Tạo điều kiện truy vấn với Prisma
            const where: any = {};
        
            if (isTopDeal !== undefined) {
              where.isTopDeal = isTopDeal === 'true'; // Chuyển thành boolean
            }
        
            // Truy vấn danh sách sản phẩm, lấy toàn bộ trường của bảng products
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
                // shops: {
                //   select: {
                //     logo: true, // Lấy thêm {gì thì bổ sung sau} từ bảng shops
                //   },
                // },
              },
              orderBy: { product_id: 'desc' },
              skip,
              take: pageSize,
            });
        
            // Định dạng dữ liệu đầu ra
            // const formattedProducts = products.map((product) => ({
              // ...products, // Giữ nguyên toàn bộ thông tin của product
              // logo: product.shops.logo, // Thêm logo vào kết quả
              // shops: undefined, // Xóa key `shops` thừa trong dữ liệu trả về
            // }));
        
            // Gọi PaginationService để lấy thông tin phân trang
            const paginationMeta = await this.paginationService.paginate(
              this.prismaService.products, // Model Prisma
              currentPage,
              pageSize,
              where,
            );
        
            let dataGet = {
              status: 'success',
              filters: {
                isTopDeal: isTopDeal || null,
                limit: pageSize,
              },
              data: {
                docs: products,
                // formattedProducts,
                pages: paginationMeta,
              },
            };
          
          // --------------
          // Lưu vào cache (lần 1)
          await this.cacheManager.set("get_all_product_tiki", dataGet);
      
          return dataGet;
        } catch (error) {
          console.error("Error in findAll:", error);
          throw new Error("Đã xảy ra lỗi khi lấy danh sách sản phẩm.");
        }
  }
  async findAllName(data) {
    let { isTopDeal, title} = data
    // Xây dựng query động
    let mustConditions: any[] = [];

    // Nếu có truyền title
    if (title) {
      mustConditions.push({
        match: {
          title: title
        }
      });
    }

    // Nếu có truyền isTopDeal
    if (isTopDeal !== undefined) {
      mustConditions.push({
        match: {
          istopdeal: isTopDeal === 'true'  // convert string về boolean, note: Use lowercase 'istopdeal' to match index
        }
      });
    }
  
    try {
      let result = await this.elasticService.search({
        index: "tiki-product-index",
        query: {
          bool: {
            must: mustConditions
          }
        }
      });
      return result;
    } catch (error) {
      // console.error(error);
      throw new RpcException(error.message || 'Elastic query failed');
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

    // Nếu official được truyền vào, kiểm tra và thêm vào query
    if (official !== undefined) {
        query.official = official === 'true'; // Chuyển đổi chuỗi "true" thành boolean
    }

    // Thực hiện truy vấn trong Prisma
    const shops = await this.prismaService.shops.findMany({
        where: query,
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

async findCategory(data: { category_id: number }) {
  const { category_id } = data;
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

async findProduct(title: string) {
  let dataCache = await this.cacheManager.get(`get_title_product_${title}`);
  //lần 2
  if (dataCache){
    return dataCache;
  }
    let dataGet = await this.prismaService.products.findMany({
      where:{
        title:{
          contains: title, //LIKE '%title%'
          mode: 'insensitive' 
        }
      } 
    })
    // lần 1
    this.cacheManager.set(`get_title_product_${title}`, dataGet);
    return dataGet;
  }

}
