import { Outlet, Link, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuthStore } from '@/stores/authStore';
import { LogOut } from 'lucide-react';

export default function AdminLayout() {
  const { isAuthenticated, role, logout } = useAuthStore();

  if (!isAuthenticated || role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen">
      {/* Admin Navbar */}
      <nav className="h-14 bg-primary sticky top-0 z-50 border-b border-primary-foreground/10 flex items-center justify-between px-6">
        <Link to="/admin" className="font-display text-xl text-primary-foreground tracking-widest">
          TRACE<span className="text-highlight" style={{ fontSize: '80%' }}>™</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-[10px] uppercase tracking-widest text-primary-foreground/50 hover:text-primary-foreground">
            View Store
          </Link>
          <button
            onClick={logout}
            className="text-primary-foreground/50 hover:text-primary-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </nav>

      <div className="flex">
        <AdminSidebar />
        <main className="lg:ml-64 flex-1 min-h-[calc(100vh-56px)] bg-background p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
