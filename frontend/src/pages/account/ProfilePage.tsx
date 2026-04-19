import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { ApiResponse, User } from '@/types';

export default function ProfilePage() {
  const { user, token, login } = useAuthStore();
  const [name, setName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');

  useEffect(() => {
    setName(user?.full_name || '');
    setPhone(user?.phone_number || '');
  }, [user?.full_name, user?.phone_number]);

  const update = useMutation({
    mutationFn: async (body: { full_name: string; phone_number: string | null }) => {
      const { data } = await api.put<ApiResponse<User>>('/me', body);
      return data.data;
    },
    onSuccess: (updated) => {
      if (token) login(updated, token);
      toast.success('Profile updated');
    },
    onError: (err: unknown) => {
      const ax = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(ax?.response?.data?.error?.message || 'Update failed');
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPhone = phone.trim();
    update.mutate({
      full_name: name.trim(),
      phone_number: trimmedPhone === '' ? null : trimmedPhone,
    });
  };

  return (
    <div>
      <h1 className="font-display text-4xl mb-6">MY PROFILE</h1>
      <form onSubmit={handleSave} className="max-w-md space-y-5">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-trace"
            required
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Email</label>
          <input value={user?.email || ''} readOnly className="input-trace text-muted-foreground" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-trace"
            inputMode="tel"
            placeholder="+92 300 1234567"
            pattern="^[+0-9 ()\-]{6,20}$"
            title="Digits, spaces, +, -, ( ) — 6 to 20 characters"
          />
          <p className="mt-1 text-[10px] text-muted-foreground">
            Leave blank to remove. Digits and <code className="text-[10px]">+ - ( )</code> only.
          </p>
        </div>
        <button
          type="submit"
          className="btn-primary py-3"
          disabled={update.isPending}
        >
          {update.isPending ? 'SAVING...' : 'SAVE CHANGES →'}
        </button>
      </form>
    </div>
  );
}
