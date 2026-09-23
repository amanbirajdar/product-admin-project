import api from '@/lib/axios';
import { CancelTokenSource } from 'axios';

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  sku: string;
  weight: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: Review[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: {
    createdAt: string;
    updatedAt: string;
    barcode: string;
    qrCode: string;
  };
  images: string[];
  thumbnail: string;
}

export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface Category {
  slug: string;
  name: string;
  url: string;
}

export async function getProducts(
  limit: number = 10,
  skip: number = 0,
  cancelToken?: CancelTokenSource
): Promise<ProductsResponse> {
  const response = await api.get<ProductsResponse>('/products', {
    params: { limit, skip },
    cancelToken: cancelToken?.token,
  });
  return response.data;
}

export async function searchProducts(
  query: string,
  limit: number = 10,
  skip: number = 0,
  cancelToken?: CancelTokenSource
): Promise<ProductsResponse> {
  const response = await api.get<ProductsResponse>('/products/search', {
    params: { q: query, limit, skip },
    cancelToken: cancelToken?.token,
  });
  return response.data;
}

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>('/products/categories');
  return response.data;
}

export async function getProductsByCategory(
  category: string,
  limit: number = 10,
  skip: number = 0,
  cancelToken?: CancelTokenSource
): Promise<ProductsResponse> {
  const response = await api.get<ProductsResponse>(
    `/products/category/${category}`,
    {
      params: { limit, skip },
      cancelToken: cancelToken?.token,
    }
  );
  return response.data;
}

export async function getProductById(id: number): Promise<Product> {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
}

export async function addProduct(
  product: Omit<Product, 'id'>
): Promise<Product> {
  const response = await api.post<Product>('/products/add', product);
  return response.data;
}

export async function updateProduct(
  id: number,
  product: Partial<Product>
): Promise<Product> {
  const response = await api.put<Product>(`/products/${id}`, product);
  return response.data;
}

export async function deleteProduct(id: number): Promise<{ id: number }> {
  const response = await api.delete<{ id: number }>(`/products/${id}`);
  return response.data;
}