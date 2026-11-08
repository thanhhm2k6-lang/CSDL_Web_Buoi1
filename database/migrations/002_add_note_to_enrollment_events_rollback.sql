BEGIN;

-- Hoàn tác: Xóa cột note khỏi bảng enrollment_events
ALTER TABLE enrollment_events
DROP COLUMN note;

-- Xóa ghi nhận migration 002
DELETE FROM schema_migrations
WHERE version = '002';

COMMIT;

