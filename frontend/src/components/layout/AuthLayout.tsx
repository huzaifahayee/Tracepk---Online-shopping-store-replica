import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Simple Navbar */}
      <nav className="h-14 flex items-center justify-center border-b border-border">
        <Link to="/" className="font-display text-xl text-foreground tracking-widest">
          TRACE<span className="text-highlight" style={{ fontSize: '80%' }}>™</span>
        </Link>
      </nav>
      <main className="flex-1 flex items-center justify-center">
        <Outlet />
      </main>
    </div>
  );
}
