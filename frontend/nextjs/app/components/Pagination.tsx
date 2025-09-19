'use client'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPreviousPage: () => void
  onNextPage: () => void
  totalItems?: number
  itemsPerPage?: number
}

export default function Pagination({
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
  totalItems,
  itemsPerPage
}: PaginationProps) {
  if (totalPages <= 1) return null

  const currentPageItems = currentPage < totalPages ? itemsPerPage : (totalItems ? totalItems % (itemsPerPage || 1) || itemsPerPage : itemsPerPage)

  return (
    <div className="mt-8 space-y-4">
      {/* Pagination buttons */}
      <div className="flex justify-center items-center gap-4">
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>

        <span className="text-gray-600 dark:text-gray-400 font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Items counter */}
      {totalItems && itemsPerPage && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          Showing {currentPageItems || 0} of {totalItems} item{totalItems !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}