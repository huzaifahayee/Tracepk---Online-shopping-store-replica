import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X, ChevronDown, LogOut, User, Package } from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import MegaMenu from './MegaMenu';
import { AnimatePresence, motion } from 'framer-motion';

export default function Navbar() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const { isAuthenticated, user, admin, logout, role } = useAuthStore();
  const isAdmin = role === 'admin' && !!admin;
  const isCustomer = role === 'customer' && !!user;

  useEffect(() => {
    if (!profileOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [profileOpen]);
  const { setSearchOpen, setCartOpen, mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const cartCount = useCartStore((s) => s.itemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'SHOP', to: '/shop', hasMega: true },
    { label: 'NEW IN', to: '/shop?sort=newest', hasMega: false },
    { label: 'SALE', to: '/shop?sale=true', hasMega: false },
    { label: 'TRACK ORDER', to: '/track', hasMega: false },
  ];

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-8 left-0 right-0 h-14 bg-primary z-[50] border-b border-primary-foreground/10">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between relative">
        {/* Left — Logo */}
        <Link to="/" className="font-display text-xl text-primary-foreground tracking-widest">
          TRACE<span className="text-highlight" style={{ fontSize: '80%' }}>™</span>
        </Link>

        {/* Center — Nav Links (desktop) + MegaMenu hover zone */}
        <div
          className="hidden md:flex gap-8 items-center static"
          onMouseLeave={() => setMegaOpen(false)}
        >
          {navLinks.map((link) => (
            <div
              key={link.label}
              className="relative"
              onMouseEnter={() => link.hasMega && setMegaOpen(true)}
            >
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'text-[10px] uppercase tracking-widest text-primary-foreground/60 hover:text-primary-foreground relative py-4 transition-colors group',
                    isActive && 'text-primary-foreground'
                  )
                }
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-highlight scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </NavLink>
            </div>
          ))}
          {/* MegaMenu inside the hover zone */}
          <MegaMenu open={megaOpen} onClose={() => setMegaOpen(false)} />
        </div>

        {/* Right — Icons */}
        <div className="flex items-center gap-4">
          <button onClick={() => setSearchOpen(true)} className="text-primary-foreground/60 hover:text-primary-foreground">
            <Search className="h-4 w-4" />
          </button>

          <Link to="/account/wishlist" className="text-primary-foreground/60 hover:text-primary-foreground relative">
            <Heart className={cn('h-4 w-4', wishlistCount > 0 && 'fill-highlight text-highlight')} />
          </Link>

          <button onClick={() => setCartOpen(true)} className="text-primary-foreground/60 hover:text-primary-foreground relative">
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-highlight text-highlight-foreground text-[8px] flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>

          {/* Auth / Profile */}
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="hidden md:block text-[10px] uppercase tracking-widest text-primary-foreground/60 hover:text-primary-foreground"
            >
              LOGIN
            </Link>
          ) : (
            <div className="relative hidden md:block" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                className="w-[26px] h-[26px] bg-primary-foreground/10 text-primary-foreground text-[10px] flex items-center justify-center"
                title={isAdmin ? 'Admin session' : isCustomer ? user.full_name : 'Account'}
              >
                {isCustomer ? getInitials(user.full_name) : isAdmin ? 'AD' : '?'}
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-primary border border-primary-foreground/10 shadow-none z-10"
                  >
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-[10px] uppercase tracking-widest text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5"
                      >
                        <Package className="h-3 w-3" /> Dashboard
                      </Link>
                    )}
                    {isCustomer && (
                      <>
                        <Link
                          to="/account/orders"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-[10px] uppercase tracking-widest text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5"
                        >
                          <Package className="h-3 w-3" /> My Orders
                        </Link>
                        <Link
                          to="/account/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-[10px] uppercase tracking-widest text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5"
                        >
                          <User className="h-3 w-3" /> My Account
                        </Link>
                        <Link
                          to="/account/wishlist"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-[10px] uppercase tracking-widest text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5"
                        >
                          <Heart className="h-3 w-3" /> Wishlist
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-[10px] uppercase tracking-widest text-destructive hover:bg-primary-foreground/5 w-full text-left border-t border-primary-foreground/10"
                    >
                      <LogOut className="h-3 w-3" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-primary-foreground/60 hover:text-primary-foreground"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 top-[88px] bg-primary z-[45] flex flex-col px-6 py-10"
          >
            <div className="space-y-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-display text-3xl text-primary-foreground block"
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
            <div className="mt-auto flex items-center gap-6 pb-10">
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[10px] uppercase tracking-widest text-primary-foreground/60"
                >
                  LOGIN
                </Link>
              ) : (
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="text-[10px] uppercase tracking-widest text-destructive"
                >
                  LOGOUT
                </button>
              )}
              <button onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }}>
                <Search className="h-5 w-5 text-primary-foreground/60" />
              </button>
              <button onClick={() => { setCartOpen(true); setMobileMenuOpen(false); }}>
                <ShoppingBag className="h-5 w-5 text-primary-foreground/60" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
