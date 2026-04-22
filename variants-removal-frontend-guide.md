# Hướng dẫn Cập nhật Frontend: Loại bỏ Nghiệp vụ Biến thể (Variants)

Tài liệu này tổng hợp các thay đổi về API (Endpoints), cấu trúc dữ liệu gửi lên (DTO) và cấu trúc dữ liệu trả về (Response), sau khi Backend đã loại bỏ hoàn toàn hệ thống "Biến thể sản phẩm" (Product Variants - Kích cỡ, màu sắc, v.v.).

Team Frontend cần rà soát lại các màn hình:
1. Tạo/Sửa Sản phẩm (Admin)
2. Chi tiết sản phẩm (Client)
3. Giỏ hàng & Checkout (Client)

---

## 1. Module Products (Sản phẩm)

### 1.1. Bỏ gửi danh sách Biến thể & files Ảnh Biến thể
**API:**
- `POST /products` (Tạo sản phẩm)
- `PUT /products/:id` (Cập nhật sản phẩm)

**Thay đổi:**
- **Không còn** tải lên tệp ảnh mảng `variantImages`. Gửi `form-data` giờ chỉ bao gồm `thumbnail` (tối đa 1) và `gallery` (tối đa 10).
- **Không còn** gửi khóa `variants` (chuỗi JSON đại diện cho mảng phân loại) trong request body. Dữ liệu giá (`price`), giá gốc (`originalPrice`), số lượng kho (`stockQuantity`) sẽ được nhập trực tiếp và gán thẳng cho sản phẩm gốc.

### 1.2. Dữ liệu trả về Sản phẩm không còn Variants
**API ảnh hưởng:** `GET /products`, `GET /products/:id`, `GET /products/arrivals`

**Thay đổi (ProductResponseDto):**
Dữ liệu trả về sẽ **không còn key `variants`**. 
- Trước đây: `product.variants = [{ variantId: 1, sizeName: '4/4', price: 1500000... }]`
- Hiện tại: Giao diện chi tiết sản phẩm không cần render dropdown chọn Màu sắc/Kích cỡ. Mọi thông tin check tồn kho hay hiển thị giá đều thông qua:
  - `product.price` (Giá bán)
  - `product.originalPrice` (Giá gốc)
  - `product.stockQuantity` (Tồn kho thực tế)
  - `product.isStock` (Trạng thái hết hàng/còn hàng)

---

## 2. Module Carts (Giỏ hàng)

### 2.1. Payload Add to Cart / Cập nhật
**API:** `POST /carts/items`

**Thay đổi trong Body (UpsertCartItemDto):**
- **Đã gỡ bỏ:** `variantId` (number) và `productSize` (string).
- FE chỉ cần submit `productId`, `quantity` và `note` (nếu có).

### 2.2. Dữ liệu cấu trúc Giỏ hàng trả về
**API:** `GET /carts`

**Thay đổi trong Item Response:**
- **Đã gỡ bỏ:**
  - Thuộc tính `product_size` trong từng giỏ hàng (item).
  - Thuộc tính `variants` (danh sách thay đổi biến thể dropdown ở trong giỏ).
- Việc check hiển thị hết hàng hay không khả dụng sẽ tính một đường duy nhất thông qua sản phẩm chính.

### 2.3. Bỏ tính năng "Thay đổi phân loại trong giỏ hàng"
**API ĐÃ XÓA:** `PUT /carts/items/:id/variant`
- FE cần xóa nút bấm "Thay đổi phân loại/Đổi biến thể" trên UI Giỏ hàng, vì mỗi sản phẩm chỉ là 1 item duy nhất, không phụ thuộc yếu tố rẽ nhánh nào.

---

## 3. Module Orders (Checkout & Mua Hàng)

- **Checkout Payload (`POST /orders/checkout`)**: Không có gì thay đổi về định nghĩa biến vì FE vốn dĩ gọi lên qua mảng `cartItemIds`. Do cấu trúc của giỏ hàng backend tự động fetch theo item nên hoàn toàn trong suốt với Frontend.
- **Lịch sử đơn hàng / Chi tiết đơn hàng (`GET /orders/*`)**: Dữ liệu hiển thị không còn xuất ra `variant_info` hay `variant_name` cho từng order item (mặt hàng đã mua). Nên gỡ phần hiển thị kích cỡ/màu ra khỏi View Order Details.

---

## 4. Module Search & Recommendation

- Các cơ chế lọc (Price Range, Sắp xếp giá) bên Backend đang trỏ tới giá trị chung là `product.price` nên phía UI Filters cũng không dùng bất kì thuật toán tham chiếu nào tới Variant Price.

> [!NOTE]
> Khuyến nghị Frontend Developer tìm kiếm cục bộ (Global Search: `Ctrl + Shift + F`) các từ khoá như `variantId`, `variants`, `productSize`, `variantImages` trong nhánh frontend để dọn dẹp các params & Component dropdown dư thừa.
