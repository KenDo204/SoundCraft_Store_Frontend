# Phân tích Mã nguồn Frontend - SoundCraft Store (React + Vite + TS + Redux Toolkit)

Dựa trên việc phân tích mã nguồn hiện tại của dự án, dưới đây là báo cáo chi tiết về cấu trúc và chức năng của ứng dụng.

## 1. Cấu trúc chức năng (Routing)
Danh sách các trang và màn hình được định nghĩa trong hệ thống:

### Trang dành cho Khách & Người dùng (Client)
- **Trang chủ (Home):** Hiển thị banner, sản phẩm mới, sản phẩm phổ biến.
- **Danh sách sản phẩm (Products/Collection):** Hiển thị tất cả sản phẩm với các bộ lọc.
- **Chi tiết sản phẩm (Product Detail):** Xem thông tin chi tiết, hình ảnh, giá và chọn mua.
- **Blog:** Danh sách bài viết tin tức.
- **Chi tiết Blog:** Nội dung chi tiết bài viết.
- **Đăng nhập (Login):** Hỗ trợ đăng nhập thường và Google.
- **Đăng ký (Signup):** Tạo tài khoản mới.
- **Quên mật khẩu (Forgot Password):** Yêu cầu khôi phục mật khẩu.
- **Hồ sơ cá nhân (Profile):** Quản lý thông tin tài khoản (Yêu cầu đăng nhập).
- **Giỏ hàng (Cart):** Xem và điều chỉnh các sản phẩm đã chọn (Yêu cầu đăng nhập).
- **Thanh toán (Checkout):** Nhập thông tin giao hàng và chọn phương thức thanh toán (Yêu cầu đăng nhập).
- **Kết quả thanh toán (Payment Result):** Hiển thị trạng thái giao dịch sau khi thanh toán qua cổng (VNPAY).
- **Danh sách yêu thích (Wishlist):** Lưu các sản phẩm quan tâm (Yêu cầu đăng nhập).
- **Thông báo (Notifications):** Xem các thông báo từ hệ thống (Yêu cầu đăng nhập).
- **Trang 404:** Hiển thị khi đường dẫn không tồn tại.

### Trang dành cho Quản trị viên (Admin)
- **Dashboard:** Thống kê tổng quan (doanh thu, số lượng đơn hàng, sản phẩm...).
- **Quản lý Thương hiệu (Brands):** Danh sách, Thêm mới, Chỉnh sửa thương hiệu.
- **Quản lý Danh mục (Categories):** Danh sách, Thêm mới, Chỉnh sửa danh mục sản phẩm.
- **Quản lý Sản phẩm (Products):** Danh sách và các thao tác quản lý sản phẩm.
- **Quản lý Đơn hàng (Orders):** Danh sách và xử lý trạng thái đơn hàng.
- **Quản lý Banner (Banners/Sliders):** Danh sách, Thêm mới, Chỉnh sửa các slide quảng cáo.
- **Quản lý Mã giảm giá (Coupons):** Danh sách và Thêm mới mã giảm giá.
- **Quản lý Bài viết (Admin Blog):** Danh sách, Thêm mới, Chỉnh sửa bài viết.
- **Hồ sơ Admin (Admin Profile):** Thông tin cá nhân của quản trị viên.

---

## 2. Chức năng cho Client (Người dùng)
Các hành động chính mà người dùng có thể thực hiện:
- **Xác thực:** Đăng ký, Đăng nhập (Email/Google), Đăng xuất, Đổi mật khẩu.
- **Tìm kiếm & Khám phá:** Tìm kiếm sản phẩm theo từ khóa, lọc theo danh mục, thương hiệu, sắp xếp giá.
- **Tương tác sản phẩm:** Xem chi tiết, thêm vào giỏ hàng, thêm vào danh sách yêu thích.
- **Quản lý giỏ hàng:** Cập nhật số lượng, xóa sản phẩm, áp dụng mã giảm giá (Coupon).
- **Đặt hàng:** Chọn địa chỉ giao hàng (tích hợp API GHN), chọn dịch vụ vận chuyển, tính phí ship, thanh toán trực tuyến (VNPAY).
- **Theo dõi:** Xem lịch sử đơn hàng (Cần xác minh thêm trong UI vì chưa thấy route riêng rõ ràng cho Order History, có thể nằm trong Profile), nhận thông báo thời gian thực.
- **Hành vi:** Hệ thống tự động theo dõi hành vi (Tracking) như xem sản phẩm, thêm giỏ hàng để gợi ý sản phẩm phù hợp.

---

## 3. Chức năng cho Admin (Quản trị viên)
Các tác vụ quản lý trong Dashboard:
- **Thống kê:** Xem báo cáo doanh thu theo tháng/năm, thống kê số lượng khách hàng, sản phẩm bán chạy qua biểu đồ.
- **Quản lý nội dung (CRUD):**
    - Sản phẩm: Quản lý thông tin, giá, số lượng tồn kho, hình ảnh (Gallery).
    - Danh mục & Thương hiệu: Phân loại sản phẩm.
    - Bài viết: Viết tin tức, hướng dẫn sử dụng nhạc cụ.
    - Banner: Thay đổi giao diện slider trang chủ.
- **Quản lý nghiệp vụ:**
    - Đơn hàng: Theo dõi danh sách đơn hàng, cập nhật trạng thái đơn hàng (Cần xác minh thêm các bước cụ thể trong UI).
    - Khuyến mãi: Tạo và quản lý các chương trình giảm giá qua Coupon.
- **Cấu hình hệ thống:** Quản lý thông tin cá nhân admin.

---

## 4. Tương tác nghiệp vụ (Dữ liệu & API)
Cách giao diện tương tác với Server:
- **Quản lý trạng thái (State Management):** Sử dụng **Redux Toolkit**. Mỗi thực thể (Product, Cart, Order, Auth...) có một `slice` riêng để lưu trữ dữ liệu toàn cục.
- **Giao tiếp API:** 
    - Sử dụng **Axios** (cấu hình tại `src/lib/axios`) để thực hiện các yêu cầu HTTP.
    - Các file trong `src/services` (ví dụ: `product.service.ts`, `auth.service.ts`) đóng vai trò là tầng giao tiếp, định nghĩa các phương thức gọi API (`GET`, `POST`, `PUT`, `DELETE`).
- **Xử lý bất đồng bộ:** Sử dụng `createAsyncThunk` của Redux Toolkit để quản lý các action gọi API, xử lý các trạng thái `pending`, `fulfilled`, `rejected`.
- **Dữ liệu Form:** Sử dụng `FormData` cho các chức năng có liên quan đến upload hình ảnh (Product, Category, Slider) và JSON cho các dữ liệu văn bản thông thường.
- **Tích hợp bên thứ ba:** 
    - **GHN (Giao Hàng Nhanh):** Gọi API để lấy danh sách tỉnh/thành, quận/huyện và tính phí vận chuyển.
    - **VNPAY:** Chuyển hướng người dùng sang cổng thanh toán và nhận phản hồi qua URL callback.
    - **Google Social Login:** Firebase hoặc thư viện liên quan để lấy token đăng nhập.
- **Theo dõi hành vi (Tracking):** Một `TrackingService` được thiết lập để thu thập hành động người dùng (view, add to cart, search) và gửi về server theo lô (batch) mỗi 30 giây hoặc khi đủ số lượng để tối ưu hiệu năng.

---
*Báo cáo này được tổng hợp từ cấu trúc thư mục và nội dung mã nguồn của dự án.*
