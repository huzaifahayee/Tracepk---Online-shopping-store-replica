import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import type { ApiResponse, User } from '@/types';

export default function AddressesPage() {
  const { user, token, login } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(user?.address || '');

  useEffect(() => {
    setDraft(user?.address || '');
  }, [user?.address]);

  const update = useMutation({
    mutationFn: async (address: string | null) => {
      const { data } = await api.put<ApiResponse<User>>('/me', { address });
      return data.data;
    },
    onSuccess: (updated, addressArg) => {
      if (token) login(updated, token);
      setEditing(false);
      toast.success(addressArg === null ? 'Address removed' : 'Address saved');
    },
    onError: (err: unknown) => {
      const ax = err as { response?: { data?: { error?: { message?: string } } } };
      toast.error(ax?.response?.data?.error?.message || 'Update failed');
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      toast.error('Address cannot be empty. Use Delete to remove.');
      return;
    }
    update.mutate(trimmed);
  };

  const handleDelete = () => {
    if (!confirm('Remove your saved address?')) return;
    update.mutate(null);
  };

  const handleEdit = () => {
    setDraft(user?.address || '');
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft(user?.address || '');
    setEditing(false);
  };

  return (
    <div>
      <h1 className="font-display text-4xl mb-6">MY ADDRESSES</h1>

      <div className="max-w-md">
        {editing ? (
          <form onSubmit={handleSave} className="card-trace p-4 space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">
                {user?.address ? 'Edit address' : 'New address'}
              </label>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                maxLength={255}
                placeholder="House #, Street, Area, City"
                className="input-trace border border-input p-2 mt-1 min-h-[80px] w-full"
                required
                autoFocus
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                {draft.length}/255 characters.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={update.isPending}
                className="btn-primary py-2 px-4 text-[10px] uppercase tracking-widest"
              >
                {update.isPending ? 'SAVING...' : 'SAVE'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={update.isPending}
                className="btn-outline py-2 px-4 text-[10px] uppercase tracking-widest"
              >
                CANCEL
              </button>
            </div>
          </form>
        ) : user?.address ? (
          <div className="card-trace p-4 flex justify-between items-start gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Home</p>
                <span className="text-[9px] uppercase tracking-widest bg-highlight text-highlight-foreground px-2 py-0.5">
                  Default
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-words">
                {user.address}
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={handleEdit}
                className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={update.isPending}
                className="text-[10px] uppercase tracking-widest text-destructive hover:opacity-80 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="card-trace p-6 text-center text-sm text-muted-foreground">
            No address saved yet.
          </div>
        )}

        {!editing && !user?.address && (
          <button
            onClick={handleEdit}
            className="btn-outline py-2 mt-4 px-4 text-[10px] uppercase tracking-widest"
          >
            ADD NEW ADDRESS →
          </button>
        )}
      </div>
    </div>
  );
}
