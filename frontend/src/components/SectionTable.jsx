export default function SectionTable({
  rows,
  disabled,
  onEnroll,
  page,
  pageSize,
  onPrevPage,
  onNextPage,
}) {
  if (rows.length === 0) return <p>Không có lớp phù hợp với bộ lọc.</p>;

  return (
    <div>
      <div className="table-scroll">
        <table aria-label="Danh sách lớp học phần">
          <thead>
            <tr>
              <th>Lớp / học phần</th>
              <th>Sức chứa</th>
              <th>Đã đăng ký</th>
              <th>Còn chỗ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.class_id} data-testid={`section-${row.class_id}`}>
                <td>
                  <strong>{row.class_id}</strong>
                  <span className="subtext">{row.course_name}</span>
                  <small>{row.course_code}</small>
                </td>
                <td>{row.capacity}</td>
                <td>{row.enrolled}</td>
                <td>
                  <span className={row.remaining > 0 ? "badge" : "badge full"}>
                    {row.remaining}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    disabled={disabled || row.registered || row.remaining <= 0}
                    onClick={() => onEnroll(row.class_id)}
                  >
                    {row.registered
                      ? "Đã đăng ký"
                      : row.remaining <= 0
                        ? "Hết chỗ"
                        : "Đăng ký"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {page !== undefined && onPrevPage && onNextPage && (
        <div className="pagination">
          <button
            type="button"
            className="secondary"
            onClick={onPrevPage}
            disabled={page === 0 || disabled}
          >
            ← Trang trước
          </button>
          <span className="page-indicator">Trang {page + 1}</span>
          <button
            type="button"
            className="secondary"
            onClick={onNextPage}
            disabled={rows.length < pageSize || disabled}
          >
            Trang sau →
          </button>
        </div>
      )}
    </div>
  );
}
