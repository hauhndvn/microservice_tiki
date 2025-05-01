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
          const { page, limit, isTopDeal, category_id } = data;
          // console.log(data);
          
            // Chuyển đổi dữ liệu query từ string sang kiểu thích hợp
            const currentPage = Number(page) || 1;
            const pageSize = Number(limit) || 10;
            const currentCategory_id = Number(category_id);
            const skip = (currentPage - 1) * pageSize;
        
            // Tạo điều kiện truy vấn với Prisma
            const where: any = {};
        
            if (isTopDeal !== undefined) {
              where.isTopDeal = isTopDeal === 'true'; // Chuyển thành boolean
            }
            //bổ sung currentCategory và parentCategory (nếu có)
            if (currentCategory_id) {
              // Truy vấn danh mục để lấy parent_id
              const category = await this.prismaService.categories.findUnique({
                where: { category_id: currentCategory_id },
                select: { parent_id: true },
              });
            
              // Tạo danh sách category_id bao gồm danh mục cha và các danh mục con
              const categoryIds = [];
              if (category?.parent_id) {
                categoryIds.push(category.parent_id);
                //bổ sung các ChildCategory trong cùng parent_id
                const categoryOthers = await this.prismaService.categories.findMany({
                  where: { parent_id: category.parent_id },
                  select: { category_id: true },
                });
                
                if (categoryOthers) {
                  categoryOthers.forEach((item)=>{
                    categoryIds.push(item.category_id);
                  })
                }
              }
              // Cập nhật điều kiện where để lấy sản phẩm thuộc các category_id
              where.category_id = {
                in: categoryIds,
              };
            }
            // Truy vấn danh sách sản phẩm, lấy toàn bộ trường của bảng products
            const products = await this.prismaService.products.findMany({
              where,
              // select: {
              //   product_id: true,
              //   image: true,
              //   name: true ,
              //   title: true ,
              //   price: true ,
              //   star: true ,
              //   isTopDeal: true ,
              //   isAuthentic: true ,
              //   sale_percent: true ,
              //   shipping_type: true ,
              //   shipping_date: true ,
              //   isGlobal: true ,
              //   madeIn: true,
              //   shop_id: true,
              //   category_id: true,
              //   // shops: {
              //   //   select: {
              //   //     shop_name: true,
              //   //     star: true,
              //   //     official: true,
              //   //     logo: true, // Lấy thêm {gì thì bổ sung sau} từ bảng shops
              //   //   },
              //   // },
              // },
              orderBy: { product_id: 'desc' },
              skip,
              take: pageSize,
            });
        
            

            // Định dạng dữ liệu đầu ra
            // const formattedProducts = products.map((product) => ({
            //   ...product, // Giữ nguyên toàn bộ thông tin của product
            //   logo: product.shops.logo, // Thêm logo vào kết quả
            //   shop_name: product.shops.shop_name, 
            //   starShop: product.shops.star,
            //   officialShop: product.shops.official,
            //   shops: undefined, // Xóa key `shops` thừa trong dữ liệu trả về
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
                docs: 
                // formattedProducts,
                products,
                pages: paginationMeta,
              },
            };
          
          return dataGet;

        } catch (error) {
          console.error("Error in findAll:", error);
          throw new Error("Đã xảy ra lỗi khi lấy danh sách sản phẩm.");
        }
  }
  async findAllNameProductShop(data) {
    let { isTopDeal, title} = data;//tìm theo cả title (Products) và shop_name (Shops)
    // Xây dựng query động
    let mustConditions: any[] = [];
    let shouldConditions: any[] = [];

    // Nếu có truyền title, tìm theo title hoặc shop_name
    if (title) {
      shouldConditions.push(
        { match: { title: title } },
        { match: { shop_name: title } } // tên field trong elastic phải có 'shop_name'
      );
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
            must: mustConditions,
            should: shouldConditions,
            minimum_should_match: shouldConditions.length > 0 ? 1 : 0,
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
    const shops = await this.prismaService.shops.findFirst({
        where: query,
    });

    return {
        status: 'success',
        filters: {
            shop_id,
            official: official !== undefined ? query.official : undefined,
        },
        data: shops,
    };
}

// ít thay đổi nhất --> lưu cache
async findCategory(data: { category_id: number }) {
  const { category_id } = data;

  let dataCache = await this.cacheManager.get("get_all_categories_tiki");
    // Nếu có cache → trả về luôn (lần 2)
    if (dataCache) {
      return dataCache;
    }
    // Nếu chưa có cache → lấy data
    const query: any = { category_id };
    const categories = await this.prismaService.categories.findMany({
        where: query, // Áp dụng bộ lọc category_id và featured (nếu có)
    });
    // Lưu vào cache (lần 1)
    await this.cacheManager.set("get_all_categories_tiki", categories);
      
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

async getProduct(title: string) {
    let dataGet = await this.prismaService.products.findMany({
      where:{
        title:{
          contains: title, //LIKE '%title%'
          mode: 'insensitive' 
        }
      } 
    })
    return dataGet;
}
async getProductByID(id: string){
  let id_num = parseInt(id);
  let dataGet = await this.prismaService.products.findUnique({
    where:{
      product_id: id_num,
    },
    // select: {
    //   product_id: true,
    //   image: true,
    //   name: true ,
    //   title: true ,
    //   price: true ,
    //   star: true ,
    //   isTopDeal: true ,
    //   isAuthentic: true ,
    //   sale_percent: true ,
    //   shipping_type: true ,
    //   shipping_date: true ,
    //   isGlobal: true ,
    //   madeIn: true,
    //   shop_id: true,
    //   category_id: true,
      // shops: {
      //   select: {
      //     shop_name: true,
      //     star: true,
      //     official: true,
      //     logo: true,
      //   },
      // },
    // },
  });
  // const formattedProduct = {
  //   ...dataGet, // Giữ nguyên toàn bộ thông tin của product
  //   logo: dataGet.shops.logo, // Thêm logo vào kết quả
  //   shop_name: dataGet.shops.shop_name, 
  //   starShop: dataGet.shops.star,
  //   officialShop: dataGet.shops.official,
  //   shops: undefined, // Xóa key `shops` thừa trong dữ liệu trả về
  // };
  return dataGet
  // formattedProduct;
}
}
