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
        - slider (quảng cáo các sự kiện khuyến mại, thương mại hot),
        - trend nổi bật,
        - brand thương hiệu nổi bật với đánh giá từ 4 sao trở lên, 
        - brand Flash Sale với các sản phẩm đang giảm giá trên 25%.
        - Gợi ý hôm nay: gồm các sản phẩm mới nhất
  * Để tìm kiếm: bạn nhập một từ chứa tên sản phẩm, hoặc tên shop, rồi bấm nút tìm kiếm
  * Để mua hàng:
    + chọn sản phẩm: bạn bấm vào sản phẩm cụ thể, bấm "thêm vào giỏ" (muốn mua bao nhiêu sản phẩm cũng được).
    + Để mua hàng: có 2 cách. Cách 1 ở trang chi tiết sản phẩm bạn bấm "mua hàng" (hệ thống coi như bạn đã chọn số lượng 01 cho sản phẩm). Cách 2  bạn bấm vào biểu tượng giỏ hàng ở góc phải phía trên.
    + Đăng nhập tài khoản: nhập username/phone/email và mật khẩu. Hệ thống sẽ tự động chuyển sang trang mua hàng /cart. 
    + tại trang mua hàng /cart: bạn có thể tăng/giảm số lượng, xoá sản phẩm, xem tổng số tiền đã giảm, tổng tiền phải thanh toán.
    + bấm "mua hàng" bạn sẽ nhận được 02 thông báo qua email: "Đặt hàng qua Tiki" > "Xác nhận đơn hàng thành công" và "Giao hàng Tiki" > "Giao hàng thành công"


