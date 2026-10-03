---
title: Ví dụ Sơ đồ Mermaid
description: Học cách sử dụng Mermaid để tạo các loại sơ đồ khác nhau trong VitePress
layout: doc
aside: true
outline: [2, 3]
editLink: true
---

# Ví dụ Sơ đồ Mermaid

Trang này trình bày cách sử dụng Mermaid để tạo các loại sơ đồ khác nhau trong VitePress.

## Mermaid là gì?

Mermaid là một công cụ vẽ sơ đồ dựa trên JavaScript, sử dụng cú pháp lấy cảm hứng từ Markdown để tạo và chỉnh sửa sơ đồ. Với mô tả văn bản đơn giản, bạn có thể nhanh chóng tạo sơ đồ luồng, sơ đồ trình tự, biểu đồ Gantt và nhiều hơn nữa.

## Cách sử dụng

Tạo sơ đồ Mermaid bằng cách sử dụng khối mã ` ```mermaid ` trong tài liệu Markdown của bạn:

## Sơ đồ Luồng (Flowchart)

Sơ đồ luồng được sử dụng để hiển thị các bước và điểm quyết định trong một quy trình hoặc hệ thống.

**Ví dụ:**

```mermaid
graph TD
    A[Bắt đầu] --> B{Đã đăng nhập?}
    B -->|Có| C[Hiển thị Trang chủ]
    B -->|Không| D[Chuyển đến Đăng nhập]
    C --> E[Tải Dữ liệu người dùng]
    D --> F[Nhập Thông tin]
    F --> G{Hợp lệ?}
    G -->|Có| C
    G -->|Không| H[Hiển thị Lỗi]
    H --> F
    E --> I[Kết thúc]
```

## Sơ đồ Trình tự (Sequence Diagram)

Sơ đồ trình tự hiển thị thứ tự tương tác giữa các đối tượng.

**Ví dụ: Luồng Đăng nhập Người dùng**

```mermaid
sequenceDiagram
    participant Người dùng
    participant Giao diện
    participant Máy chủ
    participant Cơ sở dữ liệu

    Người dùng->>Giao diện: Nhập thông tin
    Giao diện->>Giao diện: Xác thực form
    Giao diện->>Máy chủ: Gửi yêu cầu đăng nhập
    Máy chủ->>Cơ sở dữ liệu: Truy vấn thông tin
    Cơ sở dữ liệu-->>Máy chủ: Trả về dữ liệu
    Máy chủ->>Máy chủ: Xác minh mật khẩu
    alt Xác thực thành công
        Máy chủ-->>Giao diện: Trả về Token
        Giao diện-->>Người dùng: Chuyển đến trang chủ
    else Xác thực thất bại
        Máy chủ-->>Giao diện: Trả về lỗi
        Giao diện-->>Người dùng: Hiển thị thông báo lỗi
    end
```

## Sơ đồ Lớp (Class Diagram)

Sơ đồ lớp hiển thị cấu trúc các lớp và mối quan hệ giữa chúng.

**Ví dụ:**

```mermaid
classDiagram
    class Người dùng {
        +String tên_đăng_nhập
        +String email
        +String mật_khẩu
        +đăng_nhập()
        +đăng_xuất()
        +đổi_mật_khẩu()
    }
    
    class Quản_trị_viên {
        +String cấp_quyền
        +xóa_người_dùng()
        +sửa_quyền()
    }
    
    class Bài_viết {
        +String tiêu_đề
        +String nội_dung
        +Date ngày_tạo
        +xuất_bản()
        +chỉnh_sửa()
        +xóa()
    }
    
    Người dùng <|-- Quản_trị_viên
    Người dùng "1" --> "*" Bài_viết : tạo
```

## Sơ đồ Trạng thái (State Diagram)

Sơ đồ trạng thái hiển thị các trạng thái khác nhau của một đối tượng trong vòng đời của nó.

**Ví dụ: Luồng Trạng thái Đơn hàng**

```mermaid
stateDiagram-v2
    [*] --> Chờ_thanh_toán
    Chờ_thanh_toán --> Đã_thanh_toán: Thanh toán thành công
    Chờ_thanh_toán --> Đã_hủy: Hủy đơn hàng
    Đã_thanh_toán --> Chờ_giao: Xác nhận
    Chờ_giao --> Đang_giao: Giao hàng
    Đang_giao --> Đã_nhận: Người dùng nhận
    Đã_nhận --> Hoàn_thành: Xác nhận
    Đã_thanh_toán --> Đang_hoàn: Yêu cầu hoàn tiền
    Đang_hoàn --> Đã_hoàn: Chấp thuận
    Đang_hoàn --> Đã_thanh_toán: Từ chối
    Đã_hủy --> [*]
    Hoàn_thành --> [*]
    Đã_hoàn --> [*]
```

## Biểu đồ Gantt

Biểu đồ Gantt được sử dụng cho quản lý dự án để hiển thị tiến độ và lịch trình công việc.

**Ví dụ: Kế hoạch Phát triển Dự án**

```mermaid
gantt
    title Lịch trình Phát triển Dự án
    dateFormat  YYYY-MM-DD
    section Yêu cầu
    Thu thập yêu cầu        :a1, 2024-01-01, 7d
    Đánh giá yêu cầu        :after a1, 3d
    section Thiết kế
    Thiết kế UI             :2024-01-11, 10d
    Thiết kế CSDL           :2024-01-11, 7d
    section Phát triển
    Phát triển Frontend     :2024-01-21, 20d
    Phát triển Backend      :2024-01-21, 20d
    section Kiểm thử
    Kiểm thử đơn vị         :2024-02-10, 7d
    Kiểm thử tích hợp       :2024-02-17, 5d
    section Triển khai
    Triển khai sản phẩm     :2024-02-22, 3d
```

## Biểu đồ Tròn (Pie Chart)

Biểu đồ tròn hiển thị tỷ lệ phần trăm của dữ liệu.

**Ví dụ: Phân bổ Ngăn xếp Công nghệ**

```mermaid
pie title Phân bổ Ngăn xếp Công nghệ
    "Vue.js" : 35
    "TypeScript" : 25
    "Node.js" : 20
    "CSS/SCSS" : 12
    "Khác" : 8
```

## Sơ đồ Git (Git Graph)

Sơ đồ Git hiển thị các nhánh và lịch sử commit của Git.

**Ví dụ:**

```mermaid
gitGraph
    commit id: "Khởi tạo dự án"
    commit id: "Thêm cấu hình cơ bản"
    branch develop
    checkout develop
    commit id: "Phát triển tính năng mới"
    commit id: "Kiểm thử tính năng"
    checkout main
    merge develop
    commit id: "Phát hành v1.0"
    branch hotfix
    checkout hotfix
    commit id: "Sửa lỗi nghiêm trọng"
    checkout main
    merge hotfix
    commit id: "Phát hành v1.0.1"
```

## Sơ đồ Thực thể Mối quan hệ (ER Diagram)

Sơ đồ ER hiển thị mối quan hệ giữa các thực thể trong cơ sở dữ liệu.

**Ví dụ:**

```mermaid
erDiagram
    NGUOI_DUNG ||--o{ DON_HANG : tạo
    NGUOI_DUNG {
        int id PK
        string ten_dang_nhap
        string email
        datetime ngay_dang_ky
    }
    DON_HANG ||--|{ CHI_TIET_DON : chứa
    DON_HANG {
        int id PK
        int nguoi_dung_id FK
        decimal tong_tien
        datetime ngay_tao
    }
    SAN_PHAM ||--o{ CHI_TIET_DON : được_mua
    SAN_PHAM {
        int id PK
        string ten
        decimal gia
        int ton_kho
    }
    CHI_TIET_DON {
        int id PK
        int don_hang_id FK
        int san_pham_id FK
        int so_luong
        decimal thanh_tien
    }
```

## Sơ đồ Tư duy (Mindmap)

Sơ đồ tư duy hiển thị mối quan hệ phân cấp giữa các ý tưởng và khái niệm.

**Ví dụ: Lộ trình Học Frontend**

```mermaid
mindmap
  root((Phát triển Frontend))
    Kiến thức cơ bản
      HTML
      CSS
      JavaScript
    Framework
      Vue.js
        Vue Router
        Vuex/Pinia
      React
        React Router
        Redux
      Angular
    Kỹ thuật
      Quản lý gói
        npm
        yarn
        pnpm
      Công cụ Build
        Webpack
        Vite
        Rollup
      Chất lượng mã
        ESLint
        Prettier
    Hiệu suất
      Chia tách mã
      Lazy Loading
      Chiến lược Cache
```

## Tài nguyên thêm

- [Tài liệu Chính thức Mermaid](https://mermaid.js.org/)
- [Trình soạn thảo Trực tuyến Mermaid](https://mermaid.live/)
- [Tham khảo Cú pháp](https://mermaid.js.org/intro/syntax-reference.html)
