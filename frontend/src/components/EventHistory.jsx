export default function EventHistory({
  events,
  page,
  pageSize,
  onPrevPage,
  onNextPage,
  disabled,
}) {
  if (!events || events.length === 0) {
    return (
      <div className="history-empty">
        <p>Chưa có nhật ký sự kiện nào cho sinh viên này.</p>
        {page > 0 && (
          <div className="pagination">
            <button
              type="button"
              className="secondary"
              onClick={onPrevPage}
              disabled={disabled}
            >
              ← Quay lại trang trước
            </button>
          </div>
        )}
      </div>
    );
  }

  function formatTimestamp(isoString) {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return isoString;
    }
  }

  return (
    <div className="event-history">
      <div className="table-scroll">
        <table aria-label="Nhật ký sự kiện đăng ký học phần">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Lớp học phần</th>
              <th>Hành động</th>
              <th>Nguồn</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id}>
                <td>{formatTimestamp(ev.occurred_at)}</td>
                <td>
                  <strong>{ev.class_section_id}</strong>
                </td>
                <td>
                  <span
                    className={`badge ${
                      ev.event_type === "CREATED"
                        ? "badge-create"
                        : "badge-cancel"
                    }`}
                  >
                    {ev.event_type === "CREATED" ? "Đăng ký" : "Hủy đăng ký"}
                  </span>
                </td>
                <td>
                  <small className="muted">{ev.source}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
          disabled={events.length < pageSize || disabled}
        >
          Trang sau →
        </button>
      </div>
    </div>
  );
}

