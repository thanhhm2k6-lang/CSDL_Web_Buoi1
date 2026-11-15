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

## Nhật ký sử dụng AI (Mục XII.3)
1. **Trường hợp 1 - Sửa lỗi thiếu biến môi trường trên GitHub Actions:**
   - *Vấn đề:* GitHub Actions runner bị đỏ ở bước `pytest backend/tests` do không có tệp `.env` (vì đã được gitignore bảo vệ).
   - *Gợi ý AI:* Thêm step sao chép tệp mẫu `cp backend/.env.docker.example backend/.env` vào `.github/workflows/ci.yml` trước khi test.
   - *Phần đã dùng & Xác minh:* Áp dụng vào CI, push commit và thấy cả 3 job chuyển sang trạng thái xanh (Passed) trên GitHub.
2. **Trường hợp 2 - Cơ chế Reverse Proxy của Nginx tránh lỗi CORS:**
   - *Vấn đề:* Trình duyệt mở tại cổng 8080 nếu gọi thẳng 8000 sẽ bị trình duyệt chặn theo chính sách Same-Origin Policy.
   - *Gợi ý AI:* Cấu hình `proxy_pass http://backend:8000/;` trong `frontend/nginx.conf` với dấu `/` ở cuối để Nginx cắt bỏ `/api/` và chuyển tiếp vào FastAPI.
   - *Phần đã dùng & Xác minh:* Sử dụng F12 Network trên trình duyệt và kiểm tra request `http://localhost:8080/api/sections` trả về 200 OK mượt mà.
3. **Trường hợp 3 - Kết nối Backend trong container tới PostgreSQL trên host:**
   - *Vấn đề:* Dùng `127.0.0.1` trong container sẽ trỏ vào chính container, không thấy PostgreSQL trên máy thật.
   - *Gợi ý AI:* Sử dụng `host.docker.internal` kèm `--add-host host.docker.internal:host-gateway` trong Compose.
   - *Phần đã dùng & Xác minh:* Chạy `curl http://127.0.0.1:8000/health` nhận được `{"status":"ok","database":"connected"}` và giữ nguyên toàn bộ dữ liệu CSDL ban đầu.

## Bài tập tự thực hành (Mục XVI.3)
- **Bài 1:** Bổ sung `assert "get" in paths["/sections"]` vào hàm `test_enrollment_methods_are_registered` trong tệp `backend/tests/test_openapi_contract.py`. Đã kiểm thử `pytest backend/tests -q` thành công 100%.
