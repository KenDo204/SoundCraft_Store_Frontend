# Tài liệu API Quản lý Tài khoản dành cho Front End (FE)

Tài liệu này đặc tả chi tiết danh sách các API, cấu trúc DTO (Request/Response) và các ràng buộc nghiệp vụ phân quyền (Role Hierarchy) đối với nhóm chức năng quản lý tài khoản người dùng.

---

## 1. Quy tắc chung & Phân cấp Quyền (Role Hierarchy)

Tất cả các API dưới đây đều yêu cầu Header:
`Authorization: Bearer <JWT_ACCESS_TOKEN>`

### Bảng phân quyền tác vụ quản trị:

| API / Tác vụ | Người gọi (Creator/Admin) | Quyền hạn & Ràng buộc hiển thị/thao tác |
| :--- | :--- | :--- |
| **Xem danh sách (`GET /admin/users`)** | `SUPER_ADMIN`<br>`OWNER` / `ADMIN`<br>`MANAGER` | - **`SUPER_ADMIN`**: Xem toàn bộ tài khoản.<br>- **`ADMIN` / `OWNER`**: Xem tất cả ngoại trừ `SUPER_ADMIN`.<br>- **`MANAGER`**: Chỉ xem được danh sách các tài khoản là `STAFF`. |
| **Xem chi tiết (`GET /admin/users/:id`)** | `SUPER_ADMIN`<br>`OWNER` / `ADMIN`<br>`MANAGER` | - **`SUPER_ADMIN`**: Xem chi tiết của bất kỳ ai.<br>- **`ADMIN` / `OWNER`**: Không xem được tài khoản `SUPER_ADMIN`.<br>- **`MANAGER`**: Chỉ xem được chi tiết tài khoản `STAFF`. |
| **Khóa / Mở khóa (`PUT /admin/users/:id/status`)** | `SUPER_ADMIN`<br>`OWNER` / `ADMIN`<br>`MANAGER` | - **`SUPER_ADMIN`**: Khóa/Mở khóa bất kỳ ai.<br>- **`ADMIN` / `OWNER`**: Không được phép khóa/mở khóa `SUPER_ADMIN`.<br>- **`MANAGER`**: Chỉ khóa/mở khóa tài khoản `STAFF`. |
| **Tạo mới tài khoản (`POST /users`)** | `SUPER_ADMIN`<br>`OWNER` / `ADMIN`<br>`MANAGER` | - **`SUPER_ADMIN`**: Tạo được bất kỳ role nào.<br>- **`ADMIN` / `OWNER`**: Tạo được các role khác ngoại trừ `SUPER_ADMIN`.<br>- **`MANAGER`**: **Chỉ** được phép tạo tài khoản có vai trò là `STAFF`. |
| **Cập nhật tài khoản (`PUT /users/:id`)** | `SUPER_ADMIN`<br>`OWNER` / `ADMIN`<br>`MANAGER` | - **`SUPER_ADMIN`**: Cập nhật bất kỳ tài khoản nào.<br>- **`ADMIN` / `OWNER`**: Không được cập nhật tài khoản `SUPER_ADMIN`, không được đổi role của ai thành `SUPER_ADMIN`.<br>- **`MANAGER`**: Chỉ được cập nhật tài khoản `STAFF` và bắt buộc `role` gán mới (nếu có) phải là `STAFF`. |
| **Xóa tài khoản (`DELETE /users/:id`)** | `SUPER_ADMIN`<br>`OWNER` / `ADMIN`<br>`MANAGER` | - **`SUPER_ADMIN`**: Xóa bất kỳ tài khoản nào.<br>- **`ADMIN` / `OWNER`**: Không được xóa tài khoản `SUPER_ADMIN`.<br>- **`MANAGER`**: Chỉ được xóa tài khoản `STAFF`. |

---

## 2. Đặc tả Chi tiết các API

### 2.1. Lấy danh sách tài khoản
- **Endpoint**: `GET /admin/users`
- **Quyền truy cập**: `SUPER_ADMIN`, `OWNER`, `ADMIN`, `MANAGER`
- **Query Parameters**:
  - `page` (number, optional, mặc định `1`): Trang cần lấy.
  - `limit` (number, optional, mặc định `10`): Số lượng phần tử mỗi trang.
  - `search` (string, optional): Tìm kiếm theo Tên, Email hoặc Số điện thoại.
  - `isActive` (string `'true'` | `'false'`, optional): Lọc theo trạng thái hoạt động.
  - `minSpending` (number, optional): Chi tiêu tối thiểu.
  - `maxSpending` (number, optional): Chi tiêu tối đa.

- **Response thành công (`200 OK`)**:
  ```json
  {
    "data": [
      {
        "user_userId": 12,
        "user_fullName": "Nguyễn Văn Nhân Viên",
        "user_email": "staff@example.com",
        "user_mobile": "0987654321",
        "user_isActive": true,
        "user_role": "ROLE_STAFF",
        "user_createdAt": "2026-05-21T05:00:00.000Z",
        "totalSpending": "1500000"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

---

### 2.2. Xem chi tiết hồ sơ tài khoản
- **Endpoint**: `GET /admin/users/:id`
- **Quyền truy cập**: `SUPER_ADMIN`, `OWNER`, `ADMIN`, `MANAGER`
- **Params**: `id` (ID của user cần xem)

- **Response thành công (`200 OK`)**:
  ```json
  {
    "status": 200,
    "data": {
      "user_id": 12,
      "full_name": "Nguyễn Văn Nhân Viên",
      "email": "staff@example.com",
      "mobile": "0987654321",
      "avatar": "https://cloudinary.com/user_avatar.png",
      "role": "ROLE_STAFF",
      "dob": "1998-05-15T00:00:00.000Z",
      "gender": "MALE",
      "is_active": true,
      "created_at": "2026-05-21T05:00:00.000Z"
    }
  }
  ```

---

### 2.3. Khóa hoặc Mở khóa tài khoản
- **Endpoint**: `PUT /admin/users/:id/status`
- **Quyền truy cập**: `SUPER_ADMIN`, `OWNER`, `ADMIN`, `MANAGER`
- **Params**: `id` (ID của user cần thay đổi trạng thái)
- **Body (`application/json`)**:
  ```json
  {
    "isActive": false
  }
  ```

- **Response thành công (`200 OK`)**:
  ```json
  {
    "status": 200,
    "message": "Đã khóa tài khoản thành công"
  }
  ```

---

### 2.4. Tạo tài khoản mới
- **Endpoint**: `POST /users`
- **Quyền truy cập**: `SUPER_ADMIN`, `OWNER`, `ADMIN`, `MANAGER`
- **Body (`application/json`)**:
  | Trường | Kiểu dữ liệu | Bắt buộc | Ràng buộc | Mô tả |
  | :--- | :--- | :--- | :--- | :--- |
  | `full_name` | String | Có | 2 - 100 ký tự | Họ và tên |
  | `email` | String | Có | Định dạng email | Email đăng nhập (Không trùng lặp) |
  | `password` | String | Có | Tối thiểu 6 ký tự | Mật khẩu tài khoản |
  | `mobile` | String | Không | Regex SĐT VN | Số điện thoại (Không trùng lặp) |
  | `role` | Enum | Không | `ROLE_CUSTOMER`, `ROLE_SUPER_ADMIN`, `ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_STAFF`, `ROLE_OWNER` | Vai trò của tài khoản |
  | `dob` | String | Không | Định dạng YYYY-MM-DD | Ngày sinh (Phải từ 18 tuổi trở lên) |
  | `gender` | Enum | Không | `MALE`, `FEMALE`, `OTHER` | Giới tính |

- **Ví dụ Body Request**:
  ```json
  {
    "full_name": "Trần Thị Nhân Viên",
    "email": "staff2@example.com",
    "password": "password123",
    "mobile": "0351234567",
    "role": "ROLE_STAFF",
    "dob": "2000-01-01",
    "gender": "FEMALE"
  }
  ```

- **Response thành công (`217 Created` hoặc `201 Created`)**:
  ```json
  {
    "status": 201,
    "message": "Tạo tài khoản thành công",
    "data": {
      "full_name": "Trần Thị Nhân Viên",
      "email": "staff2@example.com",
      "mobile": "0351234567",
      "role": "ROLE_STAFF",
      "dob": "2000-01-01T00:00:00.000Z",
      "gender": "FEMALE",
      "is_active": true,
      "user_id": 15,
      "created_at": "2026-05-21T05:25:00.000Z"
    }
  }
  ```

---

### 2.5. Cập nhật tài khoản
- **Endpoint**: `PUT /users/:id`
- **Quyền truy cập**: `SUPER_ADMIN`, `OWNER`, `ADMIN`, `MANAGER`
- **Content-Type**: `multipart/form-data` (Nếu cần cập nhật avatar dạng file ảnh) hoặc `application/json`.
- **Body**:
  | Trường | Kiểu dữ liệu | Bắt buộc | Ràng buộc | Mô tả |
  | :--- | :--- | :--- | :--- | :--- |
  | `full_name` | String | Không | 2 - 100 ký tự | Họ và tên |
  | `email` | String | Không | Định dạng email | Cập nhật email |
  | `password` | String | Không | Tối thiểu 6 ký tự | Đặt lại mật khẩu mới cho user |
  | `mobile` | String | Không | SĐT VN | Cập nhật số điện thoại |
  | `role` | Enum | Không | Các role trong hệ thống | Cập nhật vai trò |
  | `is_active` | Boolean / String | Không | `true`, `false`, `1`, `0` | Cập nhật trạng thái hoạt động |
  | `dob` | String | Không | YYYY-MM-DD | Ngày sinh (>= 18 tuổi) |
  | `gender` | Enum | Không | `MALE`, `FEMALE`, `OTHER` | Giới tính |
  | `file` | File | Không | File ảnh avatar | Upload file ảnh mới lên Cloudinary |

- **Response thành công (`200 OK`)**:
  ```json
  {
    "status": 200,
    "message": "Cập nhật tài khoản thành công",
    "data": {
      "user_id": 12,
      "full_name": "Nguyễn Văn Đã Cập Nhật",
      "email": "staff_new@example.com",
      "avatar": "https://res.cloudinary.com/path-to-new-avatar.png",
      "role": "ROLE_STAFF",
      "is_active": true,
      "dob": "1998-05-15T00:00:00.000Z",
      "gender": "MALE"
    }
  }
  ```

---

### 2.6. Xóa tài khoản
- **Endpoint**: `DELETE /users/:id`
- **Quyền truy cập**: `SUPER_ADMIN`, `OWNER`, `ADMIN`, `MANAGER`
- **Params**: `id` (ID của user cần xóa)

- **Response thành công (`200 OK`)**:
  ```json
  {
    "status": 200,
    "message": "Xóa tài khoản thành công"
  }
  ```

---

## 3. Danh sách các mã lỗi Response thường gặp

- **`400 Bad Request`**: Dữ liệu gửi lên không đúng định dạng hoặc vi phạm ràng buộc validation (ví dụ: SĐT không hợp lệ, email đã tồn tại, người dùng chưa đủ 18 tuổi).
  ```json
  {
    "statusCode": 400,
    "message": [
      "Số điện thoại không hợp lệ",
      "Tên phải từ 2-100 ký tự"
    ],
    "error": "Bad Request"
  }
  ```
- **`403 Forbidden`**: Người gọi API không có quyền hạn truy cập hoặc vi phạm ràng buộc phân cấp vai trò quản lý (ví dụ: MANAGER cố tình chỉnh sửa/xóa tài khoản của ADMIN, hoặc ADMIN cố tạo tài khoản `SUPER_ADMIN`).
  ```json
  {
    "statusCode": 403,
    "message": "Quản lý chỉ được tạo tài khoản cho Nhân viên (STAFF)",
    "error": "Forbidden"
  }
  ```
- **`404 Not Found`**: Không tìm thấy tài khoản có ID tương ứng trong hệ thống.
  ```json
  {
    "statusCode": 404,
    "message": "Không tìm thấy người dùng",
    "error": "Not Found"
  }
  ```
