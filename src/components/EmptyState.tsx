import { PackageX } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  description?: string;
  onClearFilters?: () => void;
}

export default function EmptyState({
  message = 'No products found',
  description = 'Try adjusting your search or filter to find what you are looking for.',
  onClearFilters,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <PackageX className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {message}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium text-sm"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}