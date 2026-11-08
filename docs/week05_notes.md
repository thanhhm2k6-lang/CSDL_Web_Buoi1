# Ghi chú Buổi 5 - Frontend React & FastAPI

## I. Phác thảo giao diện (Wireframe - Mục V)

- **Link thiết kế Figma:** [CourseHub – Buổi 5](https://www.figma.com/design/aqSCrtGrDdI2m4vIRLuxmI/CourseHub-%E2%80%93-Bu%E1%BB%95i-5?node-id=6-2&t=zet7929XTzO91w87-1)
- **Bản phác cục bộ:** [wireframe_buoi5.svg](./wireframe_buoi5.svg)

![Bản phác thảo giao diện CourseHub](./wireframe_buoi5.svg)

---

### Các vùng chức năng và Component tương ứng

| Vùng giao diện | Tệp Component | Dữ liệu & Nghiệp vụ |
| :--- | :--- | :--- |
| **Thanh tiêu đề & Chọn sinh viên** | `App.jsx` | Quản lý `studentId`, nút **Xem đăng ký** để nạp danh sách môn. |
| **Danh sách lớp học phần (Bên trái)** | `SectionTable.jsx` | Hiển thị bảng lớp học phần (`WEB-01`, `DM-01`, `RACE-01`). Nút **Đăng ký** khi còn chỗ (`remaining > 0`), nút xám **Hết chỗ** (`disabled`) khi `remaining = 0`. |
| **Lớp đã đăng ký (Bên phải)** | `EnrollmentList.jsx` | Hiển thị các lớp mà sinh viên đang chọn đã đăng ký thành công. Kèm nút đỏ **Hủy đăng ký**. |
| **Khung thông báo (Dưới cùng)** | `Notice.jsx` | Hiển thị kết quả thành công (xanh lá) hoặc mã lỗi như 404, 409 Hết chỗ (đỏ). |

---

### Quy ước trạng thái kiểm thử (Bước 3)
1. **Lớp còn chỗ (`WEB-01`):** `capacity = 3`, `enrolled = 2`, `remaining = 1` $\rightarrow$ Nút **Đăng ký** màu xanh, bấm gửi request `POST /enrollments` thành công (HTTP 201).
2. **Lớp hết chỗ (`RACE-01`):** `capacity = 1`, `enrolled = 1`, `remaining = 0` $\rightarrow$ Nút xám **Hết chỗ**, nếu cố tình gọi API sẽ nhận mã lỗi xung đột HTTP 409.

---

## II. Các bài tập mở rộng (Tuần 5)

### Bài 1. Tách Form chọn sinh viên
- Tạo component `StudentForm.jsx` độc lập nhận props: `draftId`, `studentId`, `onChangeDraftId`, `onSubmit`, `onRefresh`, `busy`, `loading`.
- Sử dụng trực tiếp props từ cha, không nhân bản state cục bộ gây lệch pha dữ liệu.

### Bài 2. Bộ lọc học phần phía Frontend
- Bổ sung dropdown lọc mã học phần (`INT2204`, `INT2205`, `INT2206`) lấy từ API `GET /courses`.
- Khi không có lớp nào phù hợp, hiển thị trạng thái rỗng ("Không có lớp phù hợp với bộ lọc") mà không tác động tới CSDL.

### Bài 3. Lịch sử thao tác sinh viên có phân trang (Nhật ký Demo)
- Endpoint: `GET /enrollment-events`
  - Tham số: `student_id`, `event_type`, `dataset="demo"`, `skip`, `limit`.
  - Chỉ lọc các bản ghi `dataset = 'demo'`, tránh tải 100.000 bản ghi thử nghiệm hiệu năng (`dataset = 'performance'`) về trình duyệt.
- Component: `EventHistory.jsx` với các nút điều khiển "← Trang trước", "Trang sau →", "Trang X".

### Bài 4. Tìm kiếm & Phân trang phía Server cho Danh sách lớp học phần
- Endpoint: `GET /sections`
- **Các tham số truy vấn (Query Parameters):**
  - `q: str | None`: Từ khóa tìm kiếm không phân biệt hoa/thường (so khớp với `class_id`, `course_code` hoặc `course_name` qua toán tử `ILIKE`).
  - `course_code: str | None`: Lọc chính xác theo mã học phần (ví dụ `INT2204`).
  - `available_only: bool`: Lọc lớp còn chỗ (`remaining > 0`).
  - `skip: int`: Vị trí bắt đầu (OFFSET trong SQL, `ge=0`, mặc định 0).
  - `limit: int`: Kích thước trang (LIMIT trong SQL, ràng buộc: `1 <= limit <= 50`, mặc định 20).
- **Thứ tự sắp xếp ổn định (Deterministic Ordering):**
  - Câu truy vấn bắt buộc sử dụng: `ORDER BY v.class_id ASC`.
  - Vì `class_id` là Khóa chính (Primary Key), thứ tự kết quả giữa các lần truy vấn là duy nhất và cố định. Điều này loại bỏ hoàn toàn lỗi bản ghi bị nhảy lặp lại hoặc bị bỏ sót giữa các trang khi phân trang.
- **Phân biệt Lọc mảng tại trình duyệt vs. Phân trang CSDL:**
  - *Lọc mảng trình duyệt:* Tải toàn bộ bảng về RAM JavaScript rồi gọi `array.filter(...)`. Nếu bảng có hàng ngàn dòng sẽ làm nghẽn băng thông mạng, chậm máy trạm và không tận dụng được chỉ mục (Index) của CSDL.
  - *Phân trang CSDL:* Chuyển toàn bộ điều kiện lọc và giới hạn vào câu lệnh SQL (`WHERE ... ORDER BY ... OFFSET ... LIMIT ...`). PostgreSQL chỉ đọc, lọc và truyền đúng số dòng cần hiển thị về trình duyệt.
