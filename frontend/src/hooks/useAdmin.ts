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

export function useAdminOrders() {
  return useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AdminOrder[]>>('/admin/orders');
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

// ── Admin Users (with search, disable, delete) ──

export interface AdminUser {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  address: string | null;
  registration_date: string;
  is_disabled: boolean;
  order_count: number;
  total_spent: number;
}

export function useAdminUsers(search = '') {
  return useQuery({
    queryKey: ['admin', 'users', search],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AdminUser[]>>('/admin/users', {
        params: { search },
      });
      return data.data;
    },
    staleTime: 10_000,
  });
}

export function useDisableUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.put(`/admin/users/${id}/disable`);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'customers'] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'customers'] });
    },
  });
}

// ── Admin Dashboard ──

export interface DashboardData {
  total_users: number;
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  recent_orders: {
    order_id: number;
    order_date: string;
    order_status: string;
    total_amount: number;
    customer_name: string;
    customer_email: string;
  }[];
  top_products: {
    product_id: number;
    product_name: string;
    units_sold: number;
    revenue: number;
  }[];
  revenue_by_category: {
    category_name: string;
    revenue: number;
  }[];
  revenue_over_time: {
    order_day: string;
    orders_count: number;
    daily_revenue: number;
  }[];
  order_status_breakdown: {
    name: string;
    value: number;
  }[];
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DashboardData>>('/admin/dashboard');
      return data.data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

