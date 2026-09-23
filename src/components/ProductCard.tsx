import Link from 'next/link';
import { Edit2, Trash2, Eye, Star } from 'lucide-react';
import { Product } from '@/services/productService';
import { formatUsdToInr } from '@/lib/currency';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 border border-slate-200 dark:border-slate-700">
          <img
            src={product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/150'}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
            {product.category}
          </span>
        </div>

        <Link
          href={`/products/${product.id}`}
          className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 text-base mb-1"
        >
          {product.title}
        </Link>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
          {product.description}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800/60 mb-3 text-sm">
          <div>
            <span className="text-xs text-slate-400 block">Price</span>
            <span className="font-bold text-slate-900 dark:text-white text-base">
                    {formatUsdToInr(product.price)}
                  </span>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              {product.rating.toFixed(1)}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block text-right">Stock</span>
            <span
              className={`text-xs font-semibold ${
                product.stock > 10
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : product.stock > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {product.stock > 0 ? `${product.stock} pcs` : 'Out of stock'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <Link
            href={`/products/${product.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </Link>
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition-colors border border-amber-200 dark:border-amber-800/50"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => onDelete(product)}
            className="p-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors border border-red-200 dark:border-red-800/50"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}