import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { ApiResponse, ApiCartItem } from '@/types';

export function useServerCart() {
  const { isAuthenticated, role } = useAuthStore();
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ApiCartItem[]>>('/cart');
      return data.data;
    },
    enabled: isAuthenticated && role === 'customer',
    staleTime: 10_000,
  });
}

export function useAddToServerCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { product_id: number; quantity?: number }) => {
      const { data } = await api.post('/cart', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useUpdateServerCartQty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ cartId, quantity }: { cartId: number; quantity: number }) => {
      const { data } = await api.put(`/cart/${cartId}`, { quantity });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}

export function useRemoveServerCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cartId: number) => {
      await api.delete(`/cart/${cartId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
  });
}
