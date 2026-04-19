import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { Package, Heart, User, MapPin, Lock } from 'lucide-react';

const sideLinks = [
  { label: 'Orders', to: '/account/orders', icon: Package },
  { label: 'Wishlist', to: '/account/wishlist', icon: Heart },
  { label: 'Profile', to: '/account/profile', icon: User },
  { label: 'Addresses', to: '/account/addresses', icon: MapPin },
  { label: 'Password', to: '/account/password', icon: Lock },
];

export default function AccountLayout() {
  const { isAuthenticated, role } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/account/orders' }} replace />;
  }
  if (role !== 'customer') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 grid md:grid-cols-[200px_1fr] gap-10">
      {/* Sidebar */}
      <aside>
        <h2 className="font-display text-2xl mb-4">MY ACCOUNT</h2>
        <nav className="space-y-1">
          {sideLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 text-[10px] uppercase tracking-widest py-2 transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              <link.icon className="h-3 w-3" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      {/* Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
