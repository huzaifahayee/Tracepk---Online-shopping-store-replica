import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderOpen,
  Users,
  Boxes,
  Tag,
  BarChart3,
  Settings,
} from 'lucide-react';

const links = [
  { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag, end: false },
  { label: 'Products', to: '/admin/products', icon: Package, end: false },
  { label: 'Categories', to: '/admin/categories', icon: FolderOpen, end: false },
  { label: 'Customers', to: '/admin/customers', icon: Users, end: false },
  { label: 'Inventory', to: '/admin/inventory', icon: Boxes, end: false },
  { label: 'Discount Codes', to: '/admin/discount-codes', icon: Tag, end: false },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3, end: false },
  { label: 'Settings', to: '/admin/settings', icon: Settings, end: false },
];

export default function AdminSidebar() {
  return (
    <aside className="hidden lg:block w-64 bg-primary fixed left-0 top-14 bottom-0 border-r border-primary-foreground/10 overflow-y-auto">
      <div className="px-5 py-4 border-b border-primary-foreground/10">
        <h2 className="font-display text-lg text-primary-foreground">
          TRACE<span className="text-highlight" style={{ fontSize: '80%' }}>™</span>{' '}
          <span className="text-primary-foreground/40">ADMIN</span>
        </h2>
      </div>
      <nav className="py-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-5 py-2.5 text-[10px] uppercase tracking-widest transition-colors',
                isActive
                  ? 'text-primary-foreground border-l-2 border-l-highlight pl-[18px]'
                  : 'text-primary-foreground/50 hover:text-primary-foreground'
              )
            }
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
