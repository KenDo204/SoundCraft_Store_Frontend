# API Documentation: Review Module

Tài liệu này cung cấp chi tiết các API, DTO và quy tắc nghiệp vụ cho module Đánh giá (Review) để hỗ trợ việc tích hợp Frontend.

## 1. Thông tin chung
- **Base URL:** `/reviews`
- **Xác thực:** Hầu hết các endpoint yêu cầu `Bearer Token` (JwtAuthGuard).

---

## 2. Các đối tượng dữ liệu (DTO)

### 2.1. CreateReviewDto (Gửi đánh giá)
| Trường | Kiểu | Mô tả | Bắt buộc |
| :--- | :--- | :--- | :--- |
| `product_id` | `number` | ID của sản phẩm cần đánh giá | Có |
| `order_id` | `number` | ID đơn hàng chứa sản phẩm | Không |
| `rating` | `number` | Số sao từ 1 - 5 | Có |
| `comment` | `string` | Nội dung văn bản đánh giá | Không |
| `images` | `string[]` | Danh sách URL ảnh (lấy từ API upload) | Không |

### 2.2. UpdateReviewDto (Chỉnh sửa đánh giá)
| Trường | Kiểu | Mô tả | Bắt buộc |
| :--- | :--- | :--- | :--- |
| `rating` | `number` | Số sao mới (1 - 5) | Không |
| `comment` | `string` | Nội dung đánh giá mới | Không |
| `images` | `string[]` | Danh sách URL ảnh mới | Không |

### 2.3. ReviewQueryDto (Lọc và Phân trang)
| Tham số | Kiểu | Mô tả |
| :--- | :--- | :--- |
| `rating` | `number` | Lọc theo số sao |
| `status` | `string` | `PENDING`, `PUBLISHED`, `HIDDEN` |
| `product_id` | `number` | Lọc theo sản phẩm |
| `sort` | `string` | `highest_rating`, `lowest_rating`, `newest`, `oldest` |
| `page` | `number` | Trang hiện tại (Mặc định: 1) |
| `limit` | `number` | Số bản ghi mỗi trang (Mặc định: 10) |

---

## 3. Chức năng cho Người dùng (Customer)

### 3.1. Upload hình ảnh đánh giá
- **Endpoint:** `POST /reviews/upload`
- **Headers:** `Content-Type: multipart/form-data`
- **Body:** `images` (Files)
- **Mô tả:** Trả về danh sách URL ảnh đã upload lên Cloudinary. FE nên gọi API này trước khi gọi API tạo review.

### 3.2. Gửi đánh giá mới
- **Endpoint:** `POST /reviews`
- **Mô tả:** Tạo mới một đánh giá.
- **Quy tắc:**
    - Trạng thái mặc định là `PENDING`.
    - Nếu nội dung chứa từ ngữ vi phạm, hệ thống trả về lỗi 400.
    - Mỗi người dùng chỉ được đánh giá 1 sản phẩm 1 lần.

### 3.3. Chỉnh sửa đánh giá
- **Endpoint:** `PATCH /reviews/:id`
- **Mô tả:** Cập nhật nội dung/rating của đánh giá đã gửi.
- **Quy tắc:** Chỉ được chỉnh sửa trong vòng **7 ngày** kể từ ngày tạo.

### 3.4. Xóa đánh giá
- **Endpoint:** `DELETE /reviews/:id`
- **Mô tả:** Người dùng tự gỡ bỏ đánh giá của mình.

### 3.5. Xem danh sách đánh giá công khai
- **Endpoint:** `GET /reviews`
- **Mô tả:** Lấy các đánh giá đã được duyệt (`PUBLISHED`) của sản phẩm.

---

## 4. Chức năng cho Quản trị viên (Admin)

### 4.1. Danh sách đánh giá (Có bộ lọc)
- **Endpoint:** `GET /reviews/admin/list`
- **Quyền hạn:** `ROLE_ADMIN`
- **Mô tả:** Lấy toàn bộ danh sách đánh giá để quản lý.

### 4.2. Duyệt đánh giá
- **Endpoint:** `PATCH /reviews/:id/approve`
- **Mô tả:** Chuyển trạng thái từ `PENDING` sang `PUBLISHED`.
- **Lưu ý:** Nếu nội dung vi phạm, API sẽ báo lỗi và gợi ý chuyển sang "Ẩn đánh giá".

### 4.3. Ẩn đánh giá
- **Endpoint:** `PATCH /reviews/:id/hide`
- **Mô tả:** Gỡ hiển thị đánh giá khỏi trang sản phẩm (chuyển sang `HIDDEN`).

### 4.4. Xóa vĩnh viễn (Admin)
- **Endpoint:** `DELETE /reviews/:id/admin`
- **Mô tả:** Xóa hoàn toàn bản ghi khỏi cơ sở dữ liệu.

### 4.5. Thống kê theo sản phẩm
- **Endpoint:** `GET /reviews/statistics/:productId`
- **Mô tả:** Trả về điểm trung bình, tổng số lượt đánh giá và số lượng từng mức sao (1-5 sao).

---

## 5. Các thông báo lỗi thường gặp

- `400 Bad Request`: "Vui lòng chọn mức độ hài lòng bằng số sao"
- `400 Bad Request`: "Nội dung đánh giá chứa từ ngữ vi phạm..."
- `400 Bad Request`: "Không thể chỉnh sửa đánh giá này (đã quá thời hạn 7 ngày)"
- `403 Forbidden`: "Bạn không có quyền chỉnh sửa đánh giá này"
- `404 Not Found`: "Không tìm thấy đánh giá"
