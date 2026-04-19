import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { ApiResponse, ApiProduct, ApiCategory } from '@/types';

export function useAdminProducts(search = '') {
  return useQuery({
    queryKey: ['admin', 'products', search],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ApiProduct[]>>('/admin/products', {
        params: { search },
      });
      return data.data;
    },
    staleTime: 10_000,
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ApiCategory[]>>('/admin/products/categories');
      return data.data;
    },
    staleTime: 60_000,
  });
}

// ── Admin Categories Mutations ──

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { category_name: string; description?: string; image_url?: string }) => {
      const { data } = await api.post<ApiResponse<ApiCategory>>('/admin/products/categories', body);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: number; category_name: string; description?: string; image_url?: string }) => {
      const { data } = await api.put<ApiResponse<ApiCategory>>(`/admin/products/categories/${id}`, body);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/products/categories/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUploadProductImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('image', file);
      const { data } = await api.post<ApiResponse<{ image_url: string }>>(
        '/admin/products/upload',
        form
      );
      return data.data.image_url;
    },
  });
}

export function useUploadCategoryImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('image', file);
      const { data } = await api.post<ApiResponse<{ image_url: string }>>(
        '/admin/products/categories/upload',
        form
      );
      return data.data.image_url;
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      category_id: number;
      product_name: string;
      description?: string;
      price: number;
      stock_quantity: number;
      size?: string;
      color?: string;
      image_url?: string;
    }) => {
      const { data } = await api.post<ApiResponse<ApiProduct>>('/admin/products', body);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: number;
      category_id: number;
      product_name: string;
      description?: string;
      price: number;
      stock_quantity: number;
      size?: string;
      color?: string;
      image_url?: string;
    }) => {
      const { data } = await api.put<ApiResponse<ApiProduct>>(`/admin/products/${id}`, body);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/products/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ── Admin Orders ──

export interface AdminOrder {
  order_id: number;
  order_date: string;
  order_status: string;
  payment_method: string;
  delivery_address: string;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  item_count: number;
}

export function useAdminOrders(params: { status?: string; search?: string; date?: string } = {}) {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AdminOrder[]>>('/admin/orders', { params });
      return data.data;
    },
    staleTime: 10_000,
    refetchInterval: 5000, // Poll every 5s for real-time updates
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { data } = await api.put(`/admin/orders/${id}/status`, { status });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'orders'] }),
  });
}

export function useAdminCustomers() {
  return useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any[]>>('/admin/customers');
      return data.data;
    },
    staleTime: 60_000,
  });
}

// ── Admin Dashboard ──

export interface AdminDashboardData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeProducts: number;
  recentOrders: AdminOrder[];
  orderStatusData: { name: string; value: number }[];
  revenueData: { day: string; revenue: number; orders: number }[];
  topProducts: { name: string; sales: number }[];
  revenueByCategory: { name: string; value: number }[];
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AdminDashboardData>>('/admin/dashboard');
      return data.data;
    },
    staleTime: 30_000,
  });
}
