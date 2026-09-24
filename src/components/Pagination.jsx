export default function Pagination({ page, limit, total, onPageChange, onLimitChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="pagination">
      <span>
        Showing {total ? (page - 1) * limit + 1 : 0}–
        {Math.min(page * limit, total)} of {total}
      </span>

      <div className="pagination-controls">
        <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}>
          <option value="10">10 / page</option>
          <option value="20">20 / page</option>
          <option value="50">50 / page</option>
        </select>
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>
        <span>Page {page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
