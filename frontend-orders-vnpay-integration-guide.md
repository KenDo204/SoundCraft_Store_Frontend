# Hướng dẫn Tích hợp Frontend: Module Orders & VNPAY

Tài liệu này cung cấp các nguyên tắc, luồng nghiệp vụ (business logic) và đặc tả API để đội ngũ Frontend tích hợp mượt mà tính năng Thanh Toán VNPAY và hệ thống Quản lý Đơn hàng (Orders) sau khi loại bỏ hoàn toàn thuộc tính Sản phẩm biến thể (Product Variants).

---

## 1. Module Đơn hàng (Orders)

### 1.1. Luồng Thanh toán (Checkout)

> Quy tắc (Rules): Không còn gửi ID của biến thể. Chỉ truyền `cartItemIds` của Giỏ hàng dưới dạng biến mảng mới là `selectedItems`.
**Endpoint:** `POST /orders/checkout`
**Guard:** `JwtAuthGuard` (Yêu cầu đăng nhập)

**Payload (Body):**
```json
{
  "selectedItems": [1, 2, 3], // Mảng ID của cart_items trong giỏ hàng
  "addressId": 10,            // ID Địa chỉ giao hàng
  "paymentMethod": "COD",     // Hoặc "VNPAY"
  "couponCode": "DISCOUNT20", // (Optional)
  "orderNote": "Giao trong giờ hành chính", // (Optional)
  "totalAmount": 1500000      // (Optional) Tính nháp từ FE để BE lưu ý
}
```

**Nghiệp vụ Xử lý Checkout:**
- Khi user nhấn thanh toán, nếu chọn `paymentMethod = "COD"`, hệ thống trả về thông tin order bình thường, FE điều hướng user sang trang Thông báo Thành Công.
- Nếu chọn `paymentMethod = "VNPAY"`, API trả về biến `paymentUrl`. FE **BẮT BUỘC** phải điều hướng trình duyệt (window.location.href) tới `paymentUrl` đó để khách dùng App VNPAY hoặc mã QR thanh toán.

### 1.2. Khách hàng xem lịch sử đơn & Hủy đơn
**Xem Lịch sử Đơn hàng (Dành cho Role Customer)**
**Endpoint:** `GET /orders/me`
**Dữ liệu trả về:** Mảng các object `OrderResponse` (Xem chi tiết Data Models). Frontend lặp qua và vẽ các thẻ Đơn hàng.

**Hủy đơn hàng**
**Endpoint:** `POST /orders/:id/cancel`
**Payload:** `{ "reason": "Lý do hủy..." }`

> LƯU Ý NGHIỆP VỤ: Frontend chỉ hiển thị nút Hủy đơn khi trạng thái (status) đang là `PENDING`. Không cho phép khách hàng chủ động huỷ khi đã chuyển giao `SHIPPING` hoặc sang các tiến trình sau đó.

---

## 2. Dành cho Bảng điều khiển Quản trị (Admin Dashboard)

Chỉ xuất hiện nếu user thiết lập Token mang nội dung thuộc Role: `SUPER_ADMIN, OWNER, ADMIN`.

### 2.1. Lấy danh sách toàn bộ Đơn hàng (Của tất cả user)
**Endpoint:** `GET /orders/admin`
**Kết quả:** JSON mảng tương tự `GET /orders/me` nhưng cung cấp đủ thông tin người mua, chi tiết các món hàng. Cần xây dựng Data Table với Pagination hiển thị các dữ liệu đó.

### 2.2 Đổi trạng thái Đơn (Cập nhật tiến trình giao hàng)
**Endpoint:** `POST /orders/admin/:id/status`
**Body:**
```json
{
  "status": "SHIPPING" // Cho phép các Value: 'PENDING', 'SHIPPING', 'DELIVERED', 'CANCELLED'
}
```

### 2.3 Người dùng Yêu cầu đổi sản phẩm qua điện thoại
Trong trang quản trị, nếu khách gọi điện yêu cầu đổi hàng/tăng số lượng, Admin có thể thay đổi mảng sản phẩm.
**Endpoint:** `POST /orders/admin/:id/items`
**Body:**
```json
{
  "items": [
    { "productId": 101, "quantity": 1 },
    { "productId": 102, "quantity": 2 }
  ]
}
```
> LƯU Ý: Frontend thiết kế một popup để Admin thao tác và thêm mới hoặc xóa đi các productId bên trong order. Khi Submit lên sẽ GHI ĐÈ rải toàn bộ giỏ danh sách sản phẩm. BE tự động tính toán lại và đưa về tổng tiền (`total_amount`) đúng nhất.

---

## 3. Module Thanh toán VNPAY

Mọi nghiệp vụ tạo Signature và Security đã được Backend xử lý che giấu thông minh. Frontend cần giao tiếp ở khâu cuối cùng:

### 3.1. Hướng Frontend - Redirect VNPAY Return URL
Sau khi khách quét mã VNPAY/nhập thẻ nội địa qua cổng thanh toán của VNPay thành công (hoặc thất bại), Server VNPAY Sandbox sẽ redirect theo đường link `VNP_RETURN_URL` được cấu hình ngầm tại Backend (Hiện tại đang mock local: `http://localhost:8080/api/v1/payments/vnpay/return`).

- Nhóm Web Front-End cần xây dựng một trang trắng / Loading UI gọi là `Payment Result Page` ứng với đường dẫn URL return đó.
- Lấy Params và đọc kết quả giao dịch `vnp_ResponseCode` trên thanh URL Bar mà VNPay gửi về.
- Nếu `vnp_ResponseCode === '00'`: Giao diện thay đổi thành "Thanh toán giao dịch thành công ✅". Nếu khác, thì in dòng chữ báo lỗi / bắt khách back lại giỏ hàng.

### 3.2. Hướng Backend - Webhook VNPAY IPN 
Ở tầng vô hình (dành cho Backend), Backend đã tự động mở rộng Endpoint IPN Callback (`GET /orders/vnpay/ipn`). VNPAY Server sẽ Ping tới Back-end thẳng và báo cáo giao dịch (Chống tình huống khách thanh toán xong bị rớt mạng không lưu kịp CSDL). Trạng thái Đơn hàng của khách (`payment_status`) sẽ tự động được update thành `PAID` hoàn toàn tự tin và chính xác. Không một kẽ hở! Frontend không cần quan tâm luồng này.

---

## 4. DTO Data Models Mapping cho Redux (TypeScript Interfaces)

Dưới đây là Interface Typescript chuẩn tắc dành cho thư viện Axios Request để cấu hình trong source code Frontend:

```typescript
export interface AddressResponse {
  city?: string;
  district?: string;
  ward?: string;
  fullAddress: string;
}

export interface OrderDetailResponse {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface OrderResponse {
    id: number;
    note: string;
    orderDate: string; // ISO DateTime
    status: 'PENDING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
    totalMoney: number;
    shippingMethod: string;
    trackingNumber: string;
    paymentMethod: 'COD' | 'VNPAY';
    paymentUrl?: string; // Tồn tại khi Order VNPAY thành công
    active: boolean; // Trạng thái bị Soft Delete hay ko
    userId: number; // ID người mua
    address: AddressResponse;
    orderDetails: OrderDetailResponse[]; // Mảng danh sách sản phẩm đã mua
}
```
