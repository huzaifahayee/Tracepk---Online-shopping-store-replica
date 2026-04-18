import { useState } from 'react';
import { cn } from '@/lib/utils';

const TRACK_STEPS = [
  { label: 'ORDER PLACED', sublabel: 'Your order has been received', time: 'Apr 15, 10:30 AM' },
  { label: 'CONFIRMED', sublabel: 'Order confirmed by seller', time: 'Apr 15, 11:00 AM' },
  { label: 'PACKED', sublabel: 'Your items have been packed', time: 'Apr 15, 3:00 PM' },
  { label: 'SHIPPED', sublabel: 'Handed to courier', time: 'Apr 16, 9:00 AM' },
  { label: 'OUT FOR DELIVERY', sublabel: 'On its way to you', time: null },
  { label: 'DELIVERED', sublabel: 'Package delivered', time: null },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [tracked, setTracked] = useState(false);
  const [error, setError] = useState(false);
  const currentStep = 3; // Mock: 0-indexed, "SHIPPED" is step 3

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId && phone) {
      setTracked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <h1 className="font-display text-6xl text-center">TRACK YOUR ORDER</h1>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center mt-2 mb-10">
        Enter your order ID and phone number.
      </p>

      <form onSubmit={handleTrack} className="space-y-4">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Order ID</label>
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="TRACE-XXXXX"
            className="input-trace"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Phone Number</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03XX-XXXXXXX"
            className="input-trace"
          />
        </div>
        <button type="submit" className="w-full btn-primary py-3">TRACK →</button>
      </form>

      {tracked && (
        <div className="mt-10">
          {/* Order Header */}
          <div className="card-trace p-5 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">ORDER #{orderId}</h2>
              <span className="text-[9px] uppercase tracking-widest bg-highlight text-highlight-foreground px-2 py-0.5">
                Shipped
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Placed on April 15, 2025</p>
          </div>

          {/* Timeline */}
          <div className="space-y-0">
            {TRACK_STEPS.map((step, i) => (
              <div key={step.label} className="flex gap-4 pb-6 relative">
                {/* Left — Circle + Line */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-5 h-5 flex-shrink-0 flex items-center justify-center',
                      i <= currentStep
                        ? i === currentStep
                          ? 'bg-highlight'
                          : 'bg-foreground'
                        : 'bg-muted'
                    )}
                    style={{ borderRadius: '50%' }}
                  >
                    {i <= currentStep && <span className="text-[8px] text-white">✓</span>}
                  </div>
                  {i < TRACK_STEPS.length - 1 && (
                    <div className={cn('w-px flex-1 mt-1', i < currentStep ? 'bg-foreground' : 'bg-muted')} />
                  )}
                </div>
                {/* Right — Content */}
                <div>
                  <p className="font-display text-sm">{step.label}</p>
                  <p className="text-[10px] text-muted-foreground">{step.sublabel}</p>
                  {step.time && (
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{step.time}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="text-center mt-10">
          <h2 className="font-display text-4xl text-muted/20">ORDER NOT FOUND</h2>
        </div>
      )}
    </div>
  );
}
