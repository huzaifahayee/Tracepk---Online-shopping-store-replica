import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCategories } from '@/hooks/useProducts';

export default function Footer() {
  const [email, setEmail] = useState('');
  const { data: categories } = useCategories();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Subscribed successfully!');
    setEmail('');
  };

  // Pick first 6 categories for the footer
  const footerCategories = (categories || []).slice(0, 6);

  return (
    <footer className="bg-primary pt-20 pb-10 relative overflow-hidden">
      {/* Watermark */}
      <span className="font-display text-[14vw] text-primary-foreground/5 absolute top-4 left-6 leading-none pointer-events-none select-none">
        TRACE<span style={{ fontSize: '80%' }}>™</span>
      </span>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Col 1 — Brand */}
          <div>
            <h3 className="font-display text-2xl text-primary-foreground">
              TRACE<span className="text-highlight" style={{ fontSize: '80%' }}>™</span>
            </h3>
            <p className="text-[10px] uppercase tracking-widest text-primary-foreground/35 mt-1">
              STREETWEAR. BUILT FOR THE STREETS.
            </p>
            <p className="text-sm text-primary-foreground/50 mt-4 max-w-[180px]">
              Premium Pakistani streetwear brand. Culture-driven clothing for the bold.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-primary-foreground/40 hover:text-primary-foreground"><Instagram className="h-4 w-4" /></a>
              <a href="#" className="text-primary-foreground/40 hover:text-primary-foreground"><Twitter className="h-4 w-4" /></a>
              <a href="#" className="text-primary-foreground/40 hover:text-primary-foreground"><Facebook className="h-4 w-4" /></a>
            </div>
          </div>

          {/* Col 2 — Shop (dynamic from DB) */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-primary-foreground/30 mb-4">SHOP</h4>
            <div className="space-y-2">
              <Link
                to="/shop?sort=newest"
                className="block text-sm text-primary-foreground/55 hover:text-primary-foreground transition-colors"
              >
                New In
              </Link>
              {footerCategories.map((cat) => (
                <Link
                  key={cat.category_id}
                  to={`/shop?category=${cat.category_id}`}
                  className="block text-sm text-primary-foreground/55 hover:text-primary-foreground transition-colors"
                >
                  {cat.category_name}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 3 — Help */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-primary-foreground/30 mb-4">HELP</h4>
            <div className="space-y-2">
              <Link to="/track" className="block text-sm text-primary-foreground/55 hover:text-primary-foreground transition-colors">
                Track Order
              </Link>
              {['Returns & Exchanges', 'Size Guide', 'Contact Us', 'FAQs'].map((label) => (
                <button
                  key={label}
                  onClick={() => toast.info(`${label} - Coming soon!`)}
                  className="block text-sm text-primary-foreground/55 hover:text-primary-foreground transition-colors text-left"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Col 4 — Newsletter */}
          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-primary-foreground/30 mb-4">
              JOIN THE COMMUNITY
            </h4>
            <p className="text-sm text-primary-foreground/45 mt-2">
              Front-row seat to every drop.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR EMAIL"
                className="bg-transparent border-b border-primary-foreground/20 text-primary-foreground text-sm py-2 w-full placeholder:text-primary-foreground/30 outline-none focus:border-highlight"
              />
              <button
                type="submit"
                className="w-full bg-highlight text-highlight-foreground text-[10px] uppercase tracking-widest py-2.5 mt-3 hover:bg-primary-foreground hover:text-primary transition-colors"
              >
                SUBSCRIBE →
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/8 mt-16 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-[10px] uppercase tracking-widest text-primary-foreground/20">
            © 2025 TRACE™ — ALL RIGHTS RESERVED
          </p>
          <button onClick={() => toast.info('Policies - Coming soon!')} className="text-[10px] text-primary-foreground/20 hover:text-primary-foreground/50 cursor-pointer">
            PRIVACY POLICY · TERMS OF SERVICE
          </button>
        </div>
      </div>
    </footer>
  );
}
