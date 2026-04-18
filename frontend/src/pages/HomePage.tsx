import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Marquee from '@/components/common/Marquee';
import ProductCard from '@/components/common/ProductCard';
import { MOCK_HERO_IMAGES } from '@/lib/mockData';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useProducts, useCategories } from '@/hooks/useProducts';
import type { Product, ApiProduct } from '@/types';

const mapToProduct = (apiP: ApiProduct): Product => ({
  id: apiP.product_id,
  name: apiP.product_name,
  subtitle: apiP.color || 'Standard',
  category: apiP.category_name,
  categorySlug: apiP.category_id.toString(),
  price: apiP.price,
  originalPrice: null,
  badge: apiP.stock_quantity === 0 ? 'SOLD OUT' : null,
  slug: apiP.product_id.toString(),
  inStock: apiP.stock_quantity > 0,
  sizes: apiP.size ? apiP.size.split(',') : [],
  colors: apiP.color ? [apiP.color] : [],
  images: [apiP.image_url || ''],
  description: apiP.description || '',
  material: 'Premium Material',
  fit: 'Regular Fit',
});

const fadeUp = {
  initial: { y: 30, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

function CountUp({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [ref, inView] = useInView({ triggerOnce: true });
  const [value, setValue] = useState(0);
  const numTarget = parseInt(target.replace(/[^0-9]/g, ''));

  useEffect(() => {
    if (inView) {
      let start = 0;
      const step = Math.ceil(numTarget / 40);
      const interval = setInterval(() => {
        start += step;
        if (start >= numTarget) {
          setValue(numTarget);
          clearInterval(interval);
        } else {
          setValue(start);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [inView, numTarget]);

  return (
    <span ref={ref} className="font-display text-6xl text-primary-foreground">
      {value.toLocaleString()}{suffix}
    </span>
  );
}

export default function HomePage() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  
  const { data: categoriesData } = useCategories();
  const { data: productsData } = useProducts({ limit: 12 });

  const newInProducts = useMemo(() => {
    return (productsData?.items || []).slice(0, 8).map(mapToProduct);
  }, [productsData]);

  const bestSellers = useMemo(() => {
    return (productsData?.items || []).slice(4, 12).map(mapToProduct);
  }, [productsData]);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    toast.success('Welcome to the community!');
    setNewsletterEmail('');
  };

  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section className="min-h-screen bg-primary relative overflow-hidden flex flex-col justify-end pb-20">
        {/* BG Image */}
        <img
          src={MOCK_HERO_IMAGES.hero}
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        {/* Gradient */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, hsl(0 0% 7%) 45%, transparent 100%)' }} />
        {/* Watermark */}
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[28vw] text-primary-foreground/4 pointer-events-none select-none leading-none">
          TRACE™
        </span>
        {/* Decorative lines */}
        <div className="absolute top-[25vh] left-0 right-0 h-px bg-primary-foreground/8" />
        <div className="absolute top-[65vh] left-0 right-0 h-px bg-primary-foreground/8" />

        {/* Content */}
        <motion.div
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.1 }}
          className="relative z-10 px-6 max-w-7xl mx-auto w-full"
        >
          <motion.span
            variants={fadeUp}
            className="text-[10px] uppercase tracking-widest text-primary-foreground/50 border border-primary-foreground/15 inline-block px-3 py-1 mb-5"
          >
            SS 2025 COLLECTION
          </motion.span>
          <motion.h1
            variants={fadeUp}
            className="font-display text-7xl md:text-[10vw] text-primary-foreground leading-none"
          >
            BUILT FOR<br />THE STREETS.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-sm text-primary-foreground/55 max-w-sm mt-4"
          >
            Premium streetwear. Affordable prices. Built by the culture.
          </motion.p>
          <motion.div variants={fadeUp} className="flex gap-4 mt-8 flex-wrap">
            <Link to="/shop" className="btn-primary">SHOP NOW →</Link>
            <Link
              to="/shop?sort=newest"
              className="btn-trace border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary px-8 py-3.5"
            >
              NEW IN →
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ MARQUEE 1 ═══ */}
      <div className="bg-primary border-y border-primary-foreground/10 py-3">
        <Marquee>
          <span className="text-[10px] uppercase tracking-widest text-primary-foreground/50 mx-8">
            NEW DROP ★ TRACE™ ★ LIMITED STOCK ★ STREETWEAR ★ FREE SHIPPING ★ COD AVAILABLE ★{' '}
          </span>
        </Marquee>
      </div>

      {/* ═══ CATEGORY GRID ═══ */}
      <section className="bg-background py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-5xl">SHOP BY CATEGORY</h2>
          <div className="w-12 h-0.5 bg-highlight mt-2 mb-10" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {categoriesData?.map((cat) => (
              <Link
                key={cat.category_id}
                to={`/shop?category=${cat.category_id}`}
                className="relative group overflow-hidden aspect-[3/4]"
              >
                <div className="w-full h-full bg-muted border border-border overflow-hidden flex items-center justify-center">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.category_name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="font-display text-4xl text-foreground/5 opacity-50 absolute inset-0 flex items-center justify-center select-none uppercase -rotate-12 translate-x-3">{cat.category_name}</span>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="font-display text-xl text-white absolute bottom-3 left-3">
                  {cat.category_name}
                </span>
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-highlight opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ NEW IN ═══ */}
      <SectionWithScroll>
        <section className="bg-muted/20 py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
              <h2 className="font-display text-5xl">NEW IN</h2>
              <Link to="/shop?sort=newest" className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-highlight transition-colors">
                VIEW ALL →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {newInProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      </SectionWithScroll>

      {/* ═══ MARQUEE 2 ═══ */}
      <div className="bg-highlight py-3">
        <Marquee>
          <span className="text-primary font-display text-sm tracking-widest mx-8">
            GRAPHIC TEES ★ CARGOS ★ JERSEYS ★ HOODIES ★ TRACE™ ★ STREETWEAR ★{' '}
          </span>
        </Marquee>
      </div>

      {/* ═══ BEST SELLERS ═══ */}
      <SectionWithScroll>
        <section className="bg-background py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-5xl">BEST SELLERS</h2>
            <div className="w-12 h-0.5 bg-highlight mt-2 mb-10" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bestSellers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      </SectionWithScroll>

      {/* ═══ EDITORIAL BANNER 1 ═══ */}
      <SectionWithScroll>
        <section className="h-[70vh] relative overflow-hidden">
          <img
            src={MOCK_HERO_IMAGES.banner1}
            alt="Drop 09"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, hsl(0 0% 7% / 0.85) 40%, transparent 100%)' }} />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 px-10 max-w-lg z-10">
            <p className="text-[10px] uppercase tracking-widest text-white/50 mb-3">DROP 09</p>
            <h2 className="font-display text-6xl text-white leading-none">THE REBIRTH COLLECTION</h2>
            <p className="text-sm text-white/60 mt-4">Limited pieces. All new designs. Built different.</p>
            <Link to="/shop" className="btn-primary mt-6 inline-block">EXPLORE DROP →</Link>
          </div>
        </section>
      </SectionWithScroll>

      {/* ═══ STATS BAR ═══ */}
      <section className="bg-primary py-14 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-primary-foreground/10">
          {[
            { value: '100000', suffix: '+', label: 'Packages Delivered' },
            { value: '60000', suffix: '+', label: 'Community Members' },
            { value: '4', suffix: '+', label: 'Years in Streetwear' },
            { value: '50', suffix: '+', label: 'Team Members' },
          ].map((stat) => (
            <div key={stat.label} className="text-center px-4 py-2">
              <CountUp target={stat.value} suffix={stat.suffix} />
              <p className="text-[10px] uppercase tracking-widest text-primary-foreground/35 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ EDITORIAL BANNER 2 ═══ */}
      <SectionWithScroll>
        <section className="h-[50vh] relative overflow-hidden">
          <img
            src={MOCK_HERO_IMAGES.banner2}
            alt="Graphic Series"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to left, hsl(0 0% 7% / 0.85) 40%, transparent 100%)' }} />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 px-10 max-w-lg text-right z-10">
            <h2 className="font-display text-6xl text-white leading-none">GRAPHIC SERIES ★</h2>
            <p className="text-sm text-white/60 mt-4">Statement graphics. Premium cotton. Culture-first.</p>
            <Link to="/shop?category=graphic-tees" className="btn-primary mt-6 inline-block">
              SHOP GRAPHIC TEES →
            </Link>
          </div>
        </section>
      </SectionWithScroll>

      {/* ═══ NEWSLETTER ═══ */}
      <section className="bg-background py-16 px-6 text-center">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-5xl">JOIN THE TRACE COMMUNITY</h2>
          <p className="text-sm text-muted-foreground mt-3 mb-8">
            Front-row seat to every drop. No spam. Ever.
          </p>
          <form onSubmit={handleNewsletter} className="max-w-md mx-auto flex gap-0">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="YOUR EMAIL ADDRESS"
              className="flex-1 border-b border-border bg-transparent text-sm py-2 outline-none focus:border-foreground focus:ring-0"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground text-[10px] uppercase tracking-widest px-5 py-2 hover:bg-highlight hover:text-highlight-foreground transition-colors"
            >
              JOIN →
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function SectionWithScroll({ children }: { children: React.ReactNode }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
