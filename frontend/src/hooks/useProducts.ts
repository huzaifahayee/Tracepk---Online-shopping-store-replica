import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse, ApiProduct, PaginatedData } from '@/types';

interface ProductsParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  category?: number | null;
}

export function useProducts(params: ProductsParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<ApiProduct>>>('/products', {
        params: {
          page: params.page || 1,
          limit: params.limit || 12,
          sort: params.sort,
          search: params.search,
          category: params.category,
        },
      });
      return data.data;
    },
    staleTime: 30_000,
  });
}

export function useProduct(id: number | string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ApiProduct>>(`/products/${id}`);
      return data.data;
    },
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useSearchProducts(search: string) {
  return useQuery({
    queryKey: ['products', 'search', search],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PaginatedData<ApiProduct>>>('/products', {
        params: { search, limit: 8 },
      });
      return data.data.items;
    },
    enabled: search.length >= 2,
    staleTime: 10_000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ApiCategory[]>>('/products/categories');
      return data.data;
    },
    staleTime: 60_000,
  });
}
