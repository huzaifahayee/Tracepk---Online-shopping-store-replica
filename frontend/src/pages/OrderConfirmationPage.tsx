import { useParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();

  return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
      >
        <CheckCircle className="h-14 w-14 text-highlight mx-auto" />
      </motion.div>
      <h1 className="font-display text-6xl mt-5">ORDER PLACED!</h1>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
        ORDER #{orderId}
      </p>
      <p className="text-sm text-muted-foreground mt-3">
        We'll send a confirmation to your email.
      </p>

      <div className="card-trace p-5 text-left mt-8">
        <h3 className="text-[10px] uppercase tracking-widest border-b border-border pb-3 mb-3">ORDER DETAILS</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-semibold">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="text-[9px] uppercase tracking-widest border border-border px-2 py-0.5">Pending</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment</span>
            <span>Cash on Delivery</span>
          </div>
        </div>
      </div>

      <Link to="/track" className="block w-full bg-highlight text-highlight-foreground text-xs uppercase tracking-widest py-3 mt-6 text-center">
        TRACK YOUR ORDER →
      </Link>
      <Link to="/shop" className="block w-full text-xs uppercase tracking-widest py-3 mt-2 text-center text-muted-foreground hover:text-foreground">
        CONTINUE SHOPPING
      </Link>
    </div>
  );
}
