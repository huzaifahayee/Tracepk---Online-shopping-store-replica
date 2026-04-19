import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { useAdminUsers, useDisableUser, useDeleteUser } from '@/hooks/useAdmin';
import { toast } from 'sonner';
import { Search, UserX, UserCheck, Trash2, AlertCircle } from 'lucide-react';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { data: users, isLoading, isError } = useAdminUsers(debouncedSearch);
  const disableUser = useDisableUser();
  const deleteUser = useDeleteUser();

  // Simple debounce on search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    clearTimeout((window as any).__userSearchTimer);
    (window as any).__userSearchTimer = setTimeout(() => {
      setDebouncedSearch(value);
    }, 400);
  };

  const handleToggleDisable = async (userId: number, currentlyDisabled: boolean) => {
    try {
      await disableUser.mutateAsync(userId);
      toast.success(currentlyDisabled ? 'User account enabled' : 'User account disabled');
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const handleDelete = async (userId: number, fullName: string) => {
    if (!confirm(`Permanently delete user "${fullName}"? This cannot be undone.`)) return;
    try {
      await deleteUser.mutateAsync(userId);
      toast.success('User deleted successfully');
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Failed to delete user';
      toast.error(message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-5xl">USERS</h1>
        <span className="text-xs text-muted-foreground">
          {users ? `${users.length} users` : ''}
        </span>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, email, or username..."
            className="input-trace pl-9"
          />
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="card-trace p-10 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Failed to load users. Please try again.</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !isError && (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-trace p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && users?.length === 0 && (
        <div className="card-trace p-10 text-center">
          <p className="text-muted-foreground text-sm">
            {debouncedSearch ? `No users found matching "${debouncedSearch}"` : 'No users registered yet.'}
          </p>
        </div>
      )}

      {/* Users Table */}
      {!isLoading && !isError && users && users.length > 0 && (
        <div className="card-trace overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Name', 'Email', 'Phone', 'Orders', 'Total Spent', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-[10px] uppercase tracking-widest text-muted-foreground py-3 px-4 text-left font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.user_id}
                  className={`border-b border-border hover:bg-muted/20 ${user.is_disabled ? 'opacity-50' : ''}`}
                >
                  <td className="py-3 px-4">
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-[10px] text-muted-foreground">@{user.username}</div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                  <td className="py-3 px-4">{user.phone_number || '-'}</td>
                  <td className="py-3 px-4">{user.order_count}</td>
                  <td className="py-3 px-4">{formatPrice(user.total_spent)}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 inline-block ${
                      user.is_disabled
                        ? 'border border-destructive text-destructive'
                        : 'border border-border text-foreground'
                    }`}>
                      {user.is_disabled ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {new Date(user.registration_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleDisable(user.user_id, !!user.is_disabled)}
                        disabled={disableUser.isPending}
                        className="text-muted-foreground hover:text-foreground relative group"
                        title={user.is_disabled ? 'Enable user' : 'Disable user'}
                      >
                        {user.is_disabled ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <UserX className="w-4 h-4" />
                        )}
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {user.is_disabled ? 'Enable' : 'Disable'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(user.user_id, user.full_name)}
                        disabled={deleteUser.isPending}
                        className="text-muted-foreground hover:text-destructive relative group"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          Delete
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
