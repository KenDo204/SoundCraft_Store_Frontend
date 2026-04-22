# Hướng dẫn Tích hợp Frontend: Module User Tracking (Hành vi người dùng)

Hệ thống Tracking được thiết kế để thu thập dữ liệu hành vi của người dùng (cả khách vãng lai và người đã đăng nhập) nhằm phục vụ cho mục đích gợi ý sản phẩm và phân tích xu hướng.

---

## 1. Nguyên tắc hoạt động (Rules)

### 1.1 Cơ chế Batch Ingest (Gửi theo lô)
Để tránh làm chậm ứng dụng và giảm tải số lượng request gửi lên server, Frontend **CỐ GẮNG** không gửi request tracking lẻ tẻ mỗi khi có hành động. 
- **Quy tắc:** Thu thập các hành động vào một hàng đợi (Queue) ở Frontend (Local Storage hoặc Redux State).
- **Thời điểm gửi:** Gửi batch khi hàng đợi đạt 5-10 item, hoặc khi người dùng chuyển trang (Page Leave), hoặc sau một khoảng thời gian định kỳ (1-2 phút).

### 1.2 Định danh người dùng
Hệ thống chấp nhận 2 loại định danh:
1. `userId`: ID của người dùng nếu họ ĐÃ đăng nhập.
2. `sessionId`: Một chuỗi ngẫu nhiên (UUID) được sinh ra và lưu vào Cookie/LocalStorage của trình duyệt để định danh khách vãng lai (Anonymous).

---

## 2. Đặc tả API

**Endpoint:** `POST /tracking/behaviors/batch`
**Content-Type:** `application/json`
**Trạng thái trả về:** `202 Accepted` (Hệ thống tiếp nhận và xử lý ngầm, không bắt FE chờ kết quả lưu DB).

### Dữ liệu gửi lên (Payload):
```json
{
  "behaviors": [
    {
      "userId": 1,                // (Optional) ID người dùng nếu có
      "sessionId": "abc-123-xyz", // (Bắt buộc nếu không có userId)
      "actionType": "VIEW_PRODUCT",// Loại hành động
      "productId": 101,           // (Bắt buộc nếu là hành động liên quan sản phẩm)
      "keyword": "Guitar điện",   // (Bắt buộc nếu là hành động SEARCH)
      "contextData": {            // (Optional) Dữ liệu thêm
        "from_source": "home_page_slider"
      }
    }
  ]
}
```

---

## 3. Các loại hành vi (Action Types)

Frontend cần trigger log tracking cho các sự kiện sau:

| Action Type | Mô tả | Yêu cầu dữ liệu |
| :--- | :--- | :--- |
| `VIEW_PRODUCT` | Khi khách vào trang chi tiết sản phẩm | `productId` |
| `ADD_TO_CART` | Khi khách nhấn nút "Thêm vào giỏ" | `productId` |
| `ADD_TO_WISHLIST`| Khi khách nhấn "Yêu thích" | `productId` |
| `PURCHASE` | Khi đơn hàng thanh toán thành công | `productId` |
| `SEARCH` | Khi khách nhấn tìm kiếm | `keyword` |

---

## 4. DTO Data Models cho Frontend (TypeScript)

Gợi ý cấu trúc Interface để quản lý Tracking ở máy khách:

```typescript
export enum UserActionType {
  VIEW_PRODUCT = 'VIEW_PRODUCT',
  ADD_TO_CART = 'ADD_TO_CART',
  PURCHASE = 'PURCHASE',
  ADD_TO_WISHLIST = 'ADD_TO_WISHLIST',
  SEARCH = 'SEARCH',
}

export interface TrackingItem {
  userId?: number;
  sessionId?: string;
  actionType: UserActionType;
  productId?: number;
  categoryId?: number;
  keyword?: string;
  contextData?: Record<string, any>;
}

export interface TrackingBatchPayload {
  behaviors: TrackingItem[];
}
```

---

## 5. Lưu ý quan trọng cho Frontend
- **Xử lý lỗi:** Vì API trả về `202 Accepted`, Frontend không cần handle các lỗi logic bên trong của tracking. Chỉ cần gửi và quên (Fire and forget).
- **Bảo mật:** Module này không bắt buộc phải có Token (nhằm cho phép khách vãng lai cũng bị track), nhưng nếu gửi `userId` lên thì Backend sẽ kiểm tra tính hợp lệ của User đó trong hệ thống.
- **Tối ưu:** Tránh gửi tracking cho các hành động lặp lại quá nhanh (như spam nút search) - hãy áp dụng Debounce/Throttling trước khi đưa vào hàng đợi tracking.
