'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios, { CancelTokenSource } from 'axios';
import { Plus, Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  Product,
  Category,
  getProducts,
  searchProducts,
  getCategories,
  getProductsByCategory,
  addProduct,
  updateProduct,
  deleteProduct,
} from '@/services/productService';

import Table from '@/components/Table';
import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';
import SearchBar from '@/components/SearchBar';
import ProductForm from '@/components/ProductForm';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import Spinner from '@/components/Spinner';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State derived from URL
  const pageParam = Number(searchParams.get('page')) || 1;
  const pageSizeParam = Number(searchParams.get('pageSize')) || 10;
  const qParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const sortParam = (searchParams.get('sort') as 'price' | 'rating' | 'title') || undefined;
  const orderParam = (searchParams.get('order') as 'asc' | 'desc') || 'asc';

  // Sanitize page number
  const currentPage = Math.max(1, pageParam);
  const pageSize = [10, 20, 50].includes(pageSizeParam) ? pageSizeParam : 10;

  // Local state
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search input state (debounced)
  const [searchInput, setSearchInput] = useState(qParam);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cancellation reference
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);

  // Update URL helper
  const updateUrl = useCallback(
    (params: Record<string, string | number | undefined>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });

      router.push(`/products?${newParams.toString()}`);
    },
    [router, searchParams]
  );

  // Load categories on mount
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Fetch products function
  const fetchProducts = useCallback(async () => {
    // Cancel any in-flight request
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('New request started');
    }

    // Create a new cancel token
    cancelTokenRef.current = axios.CancelToken.source();

    setIsLoading(true);
    setError(null);

    const skip = (currentPage - 1) * pageSize;

    try {
      let data;

      if (qParam) {
        // Search takes precedence
        data = await searchProducts(qParam, pageSize, skip, cancelTokenRef.current);
      } else if (categoryParam) {
        // Filter by category
        data = await getProductsByCategory(categoryParam, pageSize, skip, cancelTokenRef.current);
      } else {
        // Default list
        data = await getProducts(pageSize, skip, cancelTokenRef.current);
      }

      let fetchedProducts = [...data.products];

      // Client-side sort if applied
      if (sortParam) {
        fetchedProducts.sort((a, b) => {
          let aVal = a[sortParam];
          let bVal = b[sortParam];

          if (typeof aVal === 'string') {
            return orderParam === 'asc'
              ? (aVal as string).localeCompare(bVal as string)
              : (bVal as string).localeCompare(aVal as string);
          }

          return orderParam === 'asc'
            ? (aVal as number) - (bVal as number)
            : (bVal as number) - (aVal as number);
        });
      }

      setProducts(fetchedProducts);
      setTotal(data.total);
    } catch (err) {
      if (axios.isCancel(err)) {
        // Request was cancelled, ignore
        return;
      }
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, qParam, categoryParam, sortParam, orderParam]);

  // Trigger fetch when URL parameters change
  useEffect(() => {
    fetchProducts();

    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, [fetchProducts]);

  // Sync search input state with URL qParam
  useEffect(() => {
    setSearchInput(qParam);
  }, [qParam]);

  // Handle debounced search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== qParam) {
        updateUrl({
          q: searchInput || undefined,
          page: 1, // Reset to page 1 on search change
          category: undefined, // Clear category when searching
        });
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchInput, qParam, updateUrl]);

  // Sorting handler
  const handleSort = (field: 'price' | 'rating' | 'title') => {
    const newOrder = sortParam === field && orderParam === 'asc' ? 'desc' : 'asc';
    updateUrl({ sort: field, order: newOrder });
  };

  // Category filter handler
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    updateUrl({
      category: category || undefined,
      page: 1, // Reset to page 1
    });
  };

  // Add/Edit Product submit
  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        // Simulated API call
        await updateProduct(editingProduct.id, formData);

        // Optimistic local state update
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? { ...p, ...formData } : p
          )
        );
        toast.success('Product updated successfully!');
      } else {
        // Simulated API call
        const created = await addProduct(formData);

        // Optimistic local state update
        const newProduct: Product = {
          ...formData,
          id: Date.now(), // Unique temporary ID
          images: formData.thumbnail ? [formData.thumbnail] : [],
        };

        setProducts((prev) => [newProduct, ...prev]);
        setTotal((prev) => prev + 1);
        toast.success('Product created successfully!');
      }

      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (err) {
      toast.error('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Product handler
  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;

    setIsSubmitting(true);
    try {
      // Simulated API call
      await deleteProduct(deletingProduct.id);

      // Optimistic local state update
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      setTotal((prev) => Math.max(0, prev - 1));
      toast.success('Product deleted successfully!');
      setDeletingProduct(null);
    } catch (err) {
      toast.error('Failed to delete product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Products
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your inventory, prices, and stock levels.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-4">
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onClear={() => setSearchInput('')}
          disabled={isLoading && products.length === 0}
        />

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <div className="flex-1 sm:flex-initial relative min-w-[160px]">
            <select
              value={categoryParam}
              onChange={handleCategoryChange}
              disabled={!!qParam} // Disabled when search is active (Rule: Search and category filter conflict)
              className="w-full appearance-none pl-3 pr-8 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            <Filter className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Selector */}
          <div className="flex-1 sm:flex-initial relative min-w-[140px]">
            <select
              value={sortParam ? `${sortParam}-${orderParam}` : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  updateUrl({ sort: undefined, order: undefined });
                } else {
                  const [field, order] = val.split('-');
                  updateUrl({ sort: field, order });
                }
              }}
              className="w-full appearance-none pl-3 pr-8 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sort By</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="title-asc">Title: A to Z</option>
            </select>
            <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Clear Filters Button */}
          {(qParam || categoryParam || sortParam) && (
            <button
              onClick={() => {
                setSearchInput('');
                router.push('/products');
              }}
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col justify-between">
        {isLoading && products.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <ErrorState message={error} onRetry={fetchProducts} />
          </div>
        ) : products.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              onClearFilters={() => {
                setSearchInput('');
                router.push('/products');
              }}
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table
                products={products}
                onEdit={(p) => {
                  setEditingProduct(p);
                  setIsFormOpen(true);
                }}
                onDelete={(p) => setDeletingProduct(p)}
                onSort={handleSort}
                currentSort={sortParam}
                sortDirection={orderParam}
              />
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={(p) => {
                    setEditingProduct(p);
                    setIsFormOpen(true);
                  }}
                  onDelete={(p) => setDeletingProduct(p)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={total}
              pageSize={pageSize}
              onPageChange={(page) => updateUrl({ page })}
              onPageSizeChange={(size) => updateUrl({ pageSize: size, page: 1 })}
              disabled={isLoading}
            />
          </>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <ProductForm
              product={editingProduct || undefined}
              categories={categories}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingProduct(null);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingProduct}
        productTitle={deletingProduct?.title || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingProduct(null)}
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 flex items-center justify-center"><Spinner size="lg" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}