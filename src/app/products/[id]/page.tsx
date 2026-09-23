'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Star,
  Shield,
  Truck,
  RotateCcw,
  Box,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
  Product,
  Category,
  getProductById,
  getCategories,
  updateProduct,
  deleteProduct,
} from '@/services/productService';
import { formatUsdToInr } from '@/lib/currency';

import Spinner from '@/components/Spinner';
import ProductForm from '@/components/ProductForm';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const productId = Number(resolvedParams.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit / Delete Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isNaN(productId) || productId <= 0) {
      setError('Product not found');
      setIsLoading(false);
      return;
    }

    Promise.all([getProductById(productId), getCategories()])
      .then(([prodData, catData]) => {
        setProduct(prodData);
        setSelectedImage(prodData.images?.[0] || prodData.thumbnail || '');
        setCategories(catData);
      })
      .catch((err) => {
        setError('Product not found');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [productId]);

  const handleEditSubmit = async (formData: any) => {
    if (!product) return;
    setIsSubmitting(true);
    try {
      await updateProduct(product.id, formData);
      setProduct((prev) => (prev ? { ...prev, ...formData } : null));
      toast.success('Product updated successfully!');
      setIsEditOpen(false);
    } catch (err) {
      toast.error('Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!product) return;
    setIsSubmitting(true);
    try {
      await deleteProduct(product.id);
      toast.success('Product deleted successfully!');
      router.push('/products');
    } catch (err) {
      toast.error('Failed to delete product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Not Found / Error State
  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Product Not Found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6 text-sm">
          The product with ID #{resolvedParams.id} could not be found or has been removed.
        </p>
        <Link
          href="/products"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action / Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all products
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition-colors border border-amber-200 dark:border-amber-800/50"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors border border-red-200 dark:border-red-800/50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 shadow-sm">
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <img
              src={selectedImage || 'https://via.placeholder.com/600'}
              alt={product.title}
              className="w-full h-full object-contain p-4"
            />
            {product.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 border-2 transition-all ${
                    selectedImage === img
                      ? 'border-blue-600 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.title} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  {product.category}
                </span>
                <span className="text-xs text-slate-400">SKU: {product.sku || 'N/A'}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {product.title}
              </h1>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Brand: <span className="font-semibold text-slate-700 dark:text-slate-200">{product.brand || 'Unbranded'}</span>
              </p>
            </div>

            {/* Price & Rating */}
            <div className="flex items-baseline gap-4 py-2 border-y border-slate-100 dark:border-slate-800">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {formatUsdToInr(product.price)}
              </span>
              <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-md">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">/ 5.0</span>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  product.stock > 10
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                    : product.stock > 0
                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                    : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                }`}
              >
                {product.stock > 0 ? `${product.stock} Units In Stock` : 'Out of Stock'}
              </span>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Description
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Additional Meta details */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Truck className="w-4 h-4 text-slate-400" />
                <span>{product.shippingInformation || 'Standard Shipping'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Shield className="w-4 h-4 text-slate-400" />
                <span>{product.warrantyInformation || '1-Year Warranty'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>{product.returnPolicy || '30-Day Return Policy'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Box className="w-4 h-4 text-slate-400" />
                <span>Min Order: {product.minimumOrderQuantity || 1} unit</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Customer Reviews ({product.reviews?.length || 0})
        </h2>

        {!product.reviews || product.reviews.length === 0 ? (
          <p className="text-sm text-slate-400">No reviews yet for this product.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.reviews.map((rev, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                        {rev.reviewerName[0] || 'U'}
                      </div>
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">
                        {rev.reviewerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-2">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
                <span className="text-[10px] text-slate-400">
                  {new Date(rev.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Edit Product
            </h2>
            <ProductForm
              product={product}
              categories={categories}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditOpen(false)}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        productTitle={product.title}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
        isLoading={isSubmitting}
      />
    </div>
  );
}