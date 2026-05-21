// components/ui/pagination.tsx

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (current > 3) pages.push('ellipsis');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('ellipsis');

  pages.push(total);

  return pages;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted text-foreground font-medium cursor-pointer text-sm transition-colors"
      >
        Anterior
      </button>
      
      {pages.map((page, i) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground">...</span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`min-w-[2rem] px-2 sm:px-3 py-1.5 rounded-lg border border-border cursor-pointer text-sm font-medium transition-all duration-200 ${
              page === currentPage
                ? 'bg-primary text-on-primary border-primary shadow-sm'
                : 'hover:bg-muted text-foreground'
            }`}
          >
            {page}
          </button>
        )
      )}
      
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted text-foreground font-medium cursor-pointer text-sm transition-colors"
      >
        Siguiente
      </button>
    </nav>
  );
}
