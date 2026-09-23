import Image from 'next/image';
import Link from 'next/link';
import { Edit2, Trash2, Eye, Star } from 'lucide-react';
import { Product } from '@/services/productService';
import { formatUsdToInr } from '@/lib/currency';

interface TableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onSort?: (field: 'price' | 'rating' | 'title') => void;
  currentSort?: string;
  sortDirection?: 'asc' | 'desc';
}

export default function Table({
  products,
  onEdit,
  onDelete,
  onSort,
  currentSort,
  sortDirection,
}: TableProps) {
  const renderSortIndicator = (field: string) => {
    if (currentSort !== field) return null;
    return <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="px-6 py-4 font-semibold">Product</th>
            <th className="px-6 py-4 font-semibold">Category</th>
            <th
              className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
              onClick={() => onSort?.('price')}
            >
              Price {renderSortIndicator('price')}
            </th>
            <th
              className="px-6 py-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
              onClick={() => onSort?.('rating')}
            >
              Rating {renderSortIndicator('rating')}
            </th>
            <th className="px-6 py-4 font-semibold">Stock</th>
            <th className="px-6 py-4 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {products.map((product) => (
            <tr
              key={product.id}
              className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700">
                    <img
                      src={product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/150'}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <Link
                      href={`/products/${product.id}`}
                      className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1"
                    >
                      {product.title}
                    </Link>
                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                      {product.brand || 'No brand'}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {product.category}
                </span>
              </td>
              <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                {formatUsdToInr(product.price)}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-slate-900 dark:text-white">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    product.stock > 10
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                      : product.stock > 0
                      ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                      : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/products/${product.id}`}
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => onEdit(product)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit product"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Delete product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}