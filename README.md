# Dự án Tiki
Dự án Capstone cuối khoá Node Advanced 03 của Nguyễn Đức Hậu

## Mục lục
- Cách sử dụng

## Cách sử dụng
- BackEnd: truy cập http://localhost:8080/swagger
  * Để up sản phẩm mới cho shop:
    + Đăng nhập shop thông qua API /auth/login-shop (nhập email và password), đăng nhập thành công sẽ có "Authorization" trả về
    + copy lại thông tin Token sau chữ Bearer
    + up sản phẩm thông qua API /product/save-product: bấm vào biểu tượng cái khoá, để hiển thị cửa sổ "Available authorizations", paste Token vào, bấm Close
    + điền thông tin về sản phẩm vào form, bấm "Execute", nếu up thành công sẽ có response trả về "Tạo sản phẩm thành công".
  * Để tạo shop mới: thông qua API /shop/save-shop, các thao tác cũng tương tự như up sản phẩm
- FrontEnd: truy cập http://localhost:3000
  * Giao diện được chia làm 2 phần,
    + bên trái là một số danh mục cố định,
    + bên phải có:
        _slider (quảng cáo các sự kiện khuyến mại, thương mại hot),
        _trend nổi bật,
        _brand thương hiệu nổi bật với đánh giá từ 4 sao trở lên, 
        _brand Flash Sale với các sản phẩm đang giảm giá trên 25%.
        _Gợi ý hôm nay: gồm các sản phẩm mới nhất
  * Để tìm kiếm: bạn nhập một từ chứa tên sản phẩm, hoặc tên shop, rồi bấm nút tìm kiếm
  * Để mua hàng:
    + chọn sản phẩm: bạn bấm vào sản phẩm cụ thể, bấm "thêm vào giỏ" (muốn mua bao nhiêu sản phẩm cũng được). Nếu bấm "mua hàng" thì coi như bạn đã chọn số lượng 01 cho sản phẩm. Hệ thống sẽ tự động chuyển sang trang mua hàng /cart.
    + Đăng nhập tài khoản: nhập username/phone/email và mật khẩu
    + tại trang mua hàng /cart: bạn có thể tăng/giảm số lượng, xoá sản phẩm
    + bấm "mua hàng" bạn sẽ nhận được 02 thông báo qua email: "Đặt hàng qua Tiki" > "Xác nhận đơn hàng thành công" và "Giao hàng Tiki" > "Giao hàng thành công"


