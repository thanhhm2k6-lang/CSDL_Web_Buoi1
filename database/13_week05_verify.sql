-- Buoi 5: chi doc du lieu. Chay tung truy van trong Query Tool.

-- 1. Kiem tra so cho con lai cua cac lop
SELECT class_id, capacity, enrolled, remaining
FROM v_section_summary
WHERE class_id IN ('WEB-01', 'RACE-01')
ORDER BY class_id;

-- 2. Kiem tra danh sach dang ky cua sinh vien 22000004
SELECT student_id, class_section_id
FROM enrollments
WHERE student_id = '22000004'
ORDER BY class_section_id;

-- 3. Kiem tra nhat ky su kien dang ky / huy mon cua sinh vien 22000004
SELECT id, student_id, class_section_id, event_type, occurred_at
FROM enrollment_events
WHERE dataset = 'demo'
  AND student_id = '22000004'
  AND class_section_id = 'WEB-01'
ORDER BY id DESC
LIMIT 10;

