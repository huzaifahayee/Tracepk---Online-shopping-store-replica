import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { ApiResponse, AuthData, AdminAuthData } from '@/types';

export function useLogin() {
  const { login } = useAuthStore();
  return useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
      const { data } = await api.post<ApiResponse<AuthData>>('/login', body);
      return data.data;
    },
    onSuccess: (data) => login(data.user, data.token),
  });
}

export function useRegister() {
  const { login } = useAuthStore();
  return useMutation({
    mutationFn: async (body: {
      username: string;
      email: string;
      password: string;
      full_name: string;
      phone_number?: string;
      address?: string;
    }) => {
      const { data } = await api.post<ApiResponse<AuthData>>('/register', body);
      return data.data;
    },
    onSuccess: (data) => login(data.user, data.token),
  });
}

export function useAdminLogin() {
  const { adminLogin } = useAuthStore();
  return useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
      const { data } = await api.post<ApiResponse<AdminAuthData>>('/admin/login', body);
      return data.data;
    },
    onSuccess: (data) => adminLogin(data.admin, data.token),
  });
}

export function usePlaceOrder() {
  return useMutation({
    mutationFn: async (body: {
      delivery_address?: string;
      payment_method?: string;
      items: { product_id: number; quantity: number }[];
    }) => {
      const { data } = await api.post('/orders', body);
      return data.data;
    },
  });
}

export function useMyOrders() {
  const { isAuthenticated, role } = useAuthStore();
  return useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any[]>>('/orders');
      return data.data;
    },
    enabled: isAuthenticated && role === 'customer',
    staleTime: 10_000,
  });
}

export function useMyOrder(id: string | number) {
  return useQuery({
    queryKey: ['my-orders', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>(`/orders/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}
