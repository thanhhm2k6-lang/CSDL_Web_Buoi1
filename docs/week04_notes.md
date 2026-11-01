### 1. Đo truy vấn trước khi có index (Mục VII.3)

- **Scan Type:** `Seq Scan` (Quét tuần tự trên bảng `enrollment_events`)
- **Rows Removed by Filter:** 1
- **Buffers:** `shared hit=1` (Planning: `shared hit=23 dirtied=1`)
- **Planning Time:** 1.422 ms
- **Execution Time:** 0.046 ms

```text
Limit (cost=1.03..1.03 rows=1 width=41) (actual time=0.021..0.022 rows=0 loops=1)
  Buffers: shared hit=1
  -> Sort (cost=1.03..1.03 rows=1 width=41) (actual time=0.020..0.021 rows=0 loops=1)
        Sort Key: occurred_at DESC
        Sort Method: quicksort Memory: 25kB
        Buffers: shared hit=1
        -> Seq Scan on enrollment_events (cost=0.00..1.02 rows=1 width=41) (actual time=0.015..0.015 rows=0 loops=1)
              Filter: ((occurred_at >= '2025-12-20 00:00:00'::timestamp without time zone) AND ((dataset)::text = 'performance'::text) AND ((student_id)::text = '22000001'::text))
              Rows Removed by Filter: 1
              Buffers: shared hit=1
Planning:
  Buffers: shared hit=23 dirtied=1
Planning Time: 1.422 ms
Execution Time: 0.046 ms

### 2. Đo truy vấn sau khi xóa/đo lại (Mục VII.3 - Lần đo 2)

- **Scan Type:** `Seq Scan` (Quét tuần tự trên bảng `enrollment_events`)
- **Rows Removed by Filter:** 1
- **Buffers:** `shared hit=1` (Planning: `shared hit=39 read=1`)
- **Planning Time:** 3.059 ms
- **Execution Time:** 0.054 ms

```text
Limit (cost=1.03..1.03 rows=1 width=41) (actual time=0.030..0.030 rows=0 loops=1)
  Buffers: shared hit=1
  -> Sort (cost=1.03..1.03 rows=1 width=41) (actual time=0.029..0.029 rows=0 loops=1)
        Sort Key: occurred_at DESC
        Sort Method: quicksort Memory: 25kB
        Buffers: shared hit=1
        -> Seq Scan on enrollment_events (cost=0.00..1.02 rows=1 width=41) (actual time=0.017..0.017 rows=0 loops=1)
              Filter: ((occurred_at >= '2025-12-20 00:00:00'::timestamp without time zone) AND ((dataset)::text = 'performance'::text) AND ((student_id)::text = '22000001'::text))
              Rows Removed by Filter: 1
              Buffers: shared hit=1
Planning:
  Buffers: shared hit=39 read=1
Planning Time: 3.059 ms
Execution Time: 0.054 ms


### Đo truy vấn EXPLAIN (ANALYZE, BUFFERS)

- **Scan Type:** `Seq Scan` (Quét tuần tự trên bảng `enrollment_events`)
- **Rows Removed by Filter:** 1
- **Buffers:** `shared hit=1`
- **Planning Time:** 0.255 ms
- **Execution Time:** 0.099 ms

```text
Limit (cost=1.03..1.03 rows=1 width=41) (actual time=0.054..0.055 rows=0 loops=1)
  Buffers: shared hit=1
  -> Sort (cost=1.03..1.03 rows=1 width=41) (actual time=0.053..0.053 rows=0 loops=1)
        Sort Key: occurred_at DESC
        Sort Method: quicksort Memory: 25kB
        Buffers: shared hit=1
        -> Seq Scan on enrollment_events (cost=0.00..1.02 rows=1 width=41) (actual time=0.039..0.040 rows=0 loops=1)
              Filter: ((occurred_at >= '2025-12-20 00:00:00'::timestamp without time zone) AND ((dataset)::text = 'performance'::text) AND ((student_id)::text = '22000001'::text))
              Rows Removed by Filter: 1
              Buffers: shared hit=1
Planning Time: 0.255 ms
Execution Time: 0.099 ms

# CourseHub - Buoi 4

- Migration 001: enrollment_events.
- Demo class: RACE-01, capacity = 1.
- POST /enrollments: lock class_sections bang FOR UPDATE.
- Concurrency test: 1 request 201, 1 request 409.
- Performance data: 100000 rows, dataset=performance.
- Index: idx_enrollment_events_dataset_student_time.