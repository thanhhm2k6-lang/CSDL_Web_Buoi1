# Buổi 6 - Docker, Testing, CI

## Môi trường
- OS: Windows 11
- Docker version: Docker version 29.2.1, build a5c7197
- Docker Compose version: v5.0.2
- Python / Node version: Python 3.12.16 / Node v22.12.0

## Kết quả kiểm thử cục bộ (Local)
- `pytest backend/tests -q`: 2 passed (test_required_paths_are_registered, test_enrollment_methods_are_registered).
- `npm test`: 8 passed in 101ms (toàn bộ 8 unit test của api.js đạt 100%).
- `npm run build`: Vite build production thành công trong ~205ms.
- `docker compose config`: Cấu hình YAML hợp lệ, resolve các biến môi trường chính xác.
- `docker compose up --build`: Khởi động thành công 2 service backend (healthy) và frontend (cổng 8080).

## Luồng tích hợp đã kiểm tra qua Reverse Proxy Nginx (Cổng 8080)
1. **Kiểm tra danh sách lớp:**
   - Request: `GET http://127.0.0.1:8080/api/sections`
   - Kết quả: HTTP 200 OK, trả về 5 lớp học phần từ CSDL PostgreSQL host.
2. **Kiểm tra đăng ký hợp lệ:**
   - Request: `POST http://127.0.0.1:8080/api/enrollments` với `WEB-02`
   - Kết quả: HTTP 201 Created.
3. **Kiểm tra hủy đăng ký:**
   - Request: `DELETE http://127.0.0.1:8080/api/enrollments/22000004/WEB-02`
   - Kết quả: HTTP 204 No Content.
4. **Kiểm tra sinh viên không tồn tại:**
   - Request: `POST http://127.0.0.1:8080/api/enrollments` với mã `99999999`
   - Kết quả: HTTP 404 Not Found (`{"detail":"Khong tim thay sinh vien"}`).
5. **Kiểm tra lớp hết chỗ (Suất cuối):**
   - Request: `POST http://127.0.0.1:8080/api/enrollments` với `DM-01`
   - Kết quả: HTTP 409 Conflict (`{"detail":"Lop hoc phan da het cho"}`).

## Ghi chú Debug & An toàn bảo mật
- **Secret:** Toàn bộ `.env`, `.env.docker` và `.env.local` được `.gitignore` và `.dockerignore` bảo vệ, không bao giờ xuất hiện trên GitHub.
- **Pytest:** Bổ sung `pytest.ini` với `pythonpath = .` để đảm bảo import package `backend` đồng nhất giữa local và runner GitHub Actions.
- **Reverse Proxy:** Nginx đón request tại cổng 8080, phục vụ trang React tĩnh và chuyển tiếp các request `/api/` vào `http://backend:8000/`.
