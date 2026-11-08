
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, student_id, class_section_id, event_type, occurred_at
FROM enrollment_events
WHERE class_section_id = 'WEB-01'
  AND event_type = 'CREATED'
  AND occurred_at >= TIMESTAMP '2025-06-01 00:00:00'
ORDER BY occurred_at DESC
LIMIT 50;


-- [BƯỚC 2]: Tạo Composite Index (Chỉ mục kết hợp)
-- Thứ tự cột: (class_section_id, event_type, occurred_at DESC)
CREATE INDEX IF NOT EXISTS idx_enrollment_events_section_type_time
ON enrollment_events (class_section_id, event_type, occurred_at DESC);

-- Cập nhật lại thống kê cho Query Planner
ANALYZE enrollment_events;


-- [BƯỚC 3]: Đo hiệu năng SAU KHI TẠO INDEX
-- Kết quả đo: Index Scan trực tiếp trên cây B-Tree, tốn ~0.22ms (nhanh hơn ~120 lần!), đọc chỉ 53 buffers
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, student_id, class_section_id, event_type, occurred_at
FROM enrollment_events
WHERE class_section_id = 'WEB-01'
  AND event_type = 'CREATED'
  AND occurred_at >= TIMESTAMP '2025-06-01 00:00:00'
ORDER BY occurred_at DESC
LIMIT 50;


-- =====================================================================
-- GIẢI THÍCH THIẾT KẾ (LÝ THUYẾT NỘP BÀI)
-- =====================================================================
-- 1. Giải thích thứ tự cột: (class_section_id, event_type, occurred_at DESC)
--    Áp dụng nguyên tắc "Equality First, Range / Sort Later":
--    - class_section_id và event_type: Là điều kiện so sánh bằng (=) nên được đặt trước.
--      B-Tree sẽ lập tức định vị chính xác nhánh dữ liệu của lớp WEB-01 và loại CREATED.
--    - occurred_at DESC: Là điều kiện so sánh khoảng (>=) và sắp xếp (ORDER BY ... DESC) nên đặt sau cùng.
--      Khi B-Tree đến đúng nhánh, các nút lá đã được sắp xếp sẵn theo thứ tự giảm dần thời gian,
--      PostgreSQL chỉ việc lấy ngay 50 dòng đầu tiên mà không cần tốn bước Sort.
--
-- 2. Tại sao không tạo index cho mọi cột?
--    - Làm chậm thao tác GHI (INSERT, UPDATE, DELETE): Mỗi khi có sinh viên đăng ký môn,
--      hệ thống phải cập nhật bảng chính và tất cả các index liên quan (Write Penalty).
--    - Tốn dung lượng ổ đĩa: Mỗi index là một cấu trúc cây B-Tree riêng biệt.
--    - Gây chậm bước lập kế hoạch truy vấn (Query Planning): Quá nhiều index khiến planner
--      mất thời gian phân tích và có nguy cơ chọn nhầm kế hoạch thực thi kém tối ưu.
-- =====================================================================

-- Lệnh hoàn tác / Xóa index sau khi thực hành xong (nếu cần):
-- DROP INDEX IF EXISTS idx_enrollment_events_section_type_time;

