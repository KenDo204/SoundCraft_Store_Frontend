# Hướng dẫn Tích hợp Frontend: Module Notifications (Thông báo)

Hệ thống thông báo cho phép người dùng nhận được các thông tin quan trọng về Đơn hàng, Khuyến mãi và các cập nhật hệ thống ngay lập tức.

---

## 1. Nguyên tắc hoạt động (Rules)

### 1.1 Quyền truy cập
- **Tất cả API** trong module này đều yêu cầu đăng nhập (`Bearer Token`).
- Người dùng chỉ có thể đọc hoặc đánh dấu đã đọc trên chính thông báo của họ.

### 1.2 Luồng hiển thị (UI/UX)
- **Badge (Số lượng):** Nên hiển thị một chấm đỏ hoặc con số trên biểu tượng Quả chuông (Header). Dữ liệu này lấy từ API `unread-count`.
- **Đánh dấu đã đọc:** Khi người dùng nhấn vào từng thông báo trong dropdown, gửi request `PUT /notifications/:id/read`. Nếu người dùng nhấn nút "Đọc tất cả", gửi request `PUT /notifications/read-all`.

---

## 2. Đặc tả API

### 2.1 Lấy danh sách thông báo
**Endpoint:** `GET /notifications`
**Query Params:** `page` (bắt đầu từ 0), `size` (mặc định 10).

**Kết quả trả về:**
```json
{
  "status": 200,
  "data": {
    "items": [
      {
        "id": 123,
        "title": "Đặt hàng thành công",
        "content": "Đơn hàng ORD-12345 của bạn đang được xử lý.",
        "type": "ORDER",
        "is_read": false,
        "created_at": "2024-04-22T..."
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

### 2.2 Lấy số lượng chưa đọc (Dùng cho Badge)
**Endpoint:** `GET /notifications/unread-count`

### 2.3 Đánh dấu đã đọc
- **Đọc tất cả:** `PUT /notifications/read-all`
- **Đọc 1 mục:** `PUT /notifications/:id/read`

---

## 3. Các loại thông báo (Notification Types)

Frontend có thể dựa vào trường `type` để hiển thị Icon hoặc Màu sắc khác nhau:

| Type | Ý nghĩa | Gợi ý Icon (Lucide/HeroIcons) |
| :--- | :--- | :--- |
| `ORDER` | Thông tin đơn hàng (Đặt hàng, giao hàng) | `ShoppingBag` |
| `PROMOTION` | Mã giảm giá, chương trình mới | `Ticket` |
| `SYSTEM` | Thông báo từ quản trị viên | `ShieldCheck` |
| `PRE_ORDER`| Hàng đã về (Dành cho sản phẩm Pre-order) | `Clock` |
| `INFO` | Các thông báo tin tức chung | `Bell` |

---

## 4. DTO Data Models cho Frontend (TypeScript)

```typescript
export enum NotificationType {
    INFO = 'INFO',
    ORDER = 'ORDER',
    PROMOTION = 'PROMOTION',
    SYSTEM = 'SYSTEM',
    PRE_ORDER = 'PRE_ORDER',
}

export interface NotificationItem {
  id: number;
  title: string;
  content: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface PaginatedNotificationResponse {
  items: NotificationItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
```

---

## 5. Lưu ý cho Frontend
- **Thời gian thực (Real-time):** Hiện tại hệ thống sử dụng HTTP Get. Để tối ưu, FE nên gọi API `unread-count` mỗi khi người dùng tải lại trang hoặc sau một khoảng thời gian nhất định (Polling).
- **Infinite Scroll:** Nếu danh sách thông báo dài, FE nên sử dụng phân trang hoặc Infinite scroll dựa trên field `page` và `totalPages`.
