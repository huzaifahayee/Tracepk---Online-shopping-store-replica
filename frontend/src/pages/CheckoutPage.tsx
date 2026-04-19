import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { usePlaceOrder } from '@/hooks/useAuth';
import { formatPrice, cn } from '@/lib/utils';
import { toast } from 'sonner';

const contactSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone required'),
  address1: z.string().min(5, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  postal_code: z.string().optional(),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const { items, subtotal, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const placeOrder = usePlaceOrder();
  const navigate = useNavigate();
  const total = subtotal();
  const shippingCost = shippingMethod === 'express' ? 400 : total >= 10000 ? 0 : 200;

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone_number || '',
      address1: user?.address || '',
    },
  });

  const steps = ['INFORMATION', 'SHIPPING', 'PAYMENT'];

  const onSubmitContact = () => setStep(2);
  const onSubmitShipping = () => setStep(3);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please log in to complete your purchase securely.');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const onPlaceOrder = async () => {
    const vals = getValues();
    const address = `${vals.address1}, ${vals.city}, ${vals.province}`;

    try {
      const data = await placeOrder.mutateAsync({
        delivery_address: address,
        payment_method: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
      });
      clearCart();
      navigate(`/order-confirmation/${data.order_id}`);
    } catch {
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-display text-5xl">CHECKOUT</h1>

      {/* Steps */}
      <div className="flex gap-4 mt-4 mb-8">
        {steps.map((s, i) => (
          <button
            key={s}
            onClick={() => i + 1 < step && setStep(i + 1)}
            className={cn(
              'text-[10px] uppercase tracking-widest pb-1',
              i + 1 === step && 'text-foreground border-b-2 border-highlight',
              i + 1 < step && 'text-muted-foreground cursor-pointer',
              i + 1 > step && 'text-muted-foreground/40'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-10">
        {/* LEFT — Form */}
        <div>
          {step === 1 && (
            <form onSubmit={handleSubmit(onSubmitContact)} className="space-y-5">
              <h3 className="text-[10px] uppercase tracking-widest mb-4">CONTACT</h3>
              {(['full_name', 'email', 'phone'] as const).map((field) => (
                <div key={field}>
                  <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">
                    {field.replace('_', ' ')}
                  </label>
                  <input {...register(field)} className="input-trace" />
                  {errors[field] && <p className="text-[10px] uppercase tracking-widest text-destructive mt-1">{errors[field]?.message}</p>}
                </div>
              ))}

              <h3 className="text-[10px] uppercase tracking-widest mt-6 mb-4">DELIVERY ADDRESS</h3>
              {[
                { name: 'address1' as const, label: 'Address Line 1' },
                { name: 'address2' as const, label: 'Address Line 2 (Optional)' },
                { name: 'city' as const, label: 'City' },
                { name: 'province' as const, label: 'Province' },
                { name: 'postal_code' as const, label: 'Postal Code' },
              ].map(({ name, label }) => (
                <div key={name}>
                  <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">{label}</label>
                  <input {...register(name)} className="input-trace" />
                  {errors[name] && <p className="text-[10px] uppercase tracking-widest text-destructive mt-1">{errors[name]?.message}</p>}
                </div>
              ))}

              <button type="submit" className="w-full btn-primary py-3 mt-4">CONTINUE →</button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-widest mb-4">SHIPPING METHOD</h3>
              {[
                { id: 'standard', label: 'Standard (3-5 days)', cost: total >= 10000 ? 'Free' : 'Rs.200' },
                { id: 'express', label: 'Express (1-2 days)', cost: 'Rs.400' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={cn(
                    'flex justify-between items-center border p-4 cursor-pointer transition-colors',
                    shippingMethod === opt.id ? 'border-foreground' : 'border-border'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.id}
                      checked={shippingMethod === opt.id}
                      onChange={() => setShippingMethod(opt.id)}
                      className="accent-highlight"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </div>
                  <span className="text-sm font-semibold">{opt.cost}</span>
                </label>
              ))}
              <button onClick={onSubmitShipping} className="w-full btn-primary py-3 mt-4">CONTINUE →</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-widest mb-4">PAYMENT METHOD</h3>
              {[
                { id: 'cod', label: 'Cash on Delivery' },
                { id: 'online', label: 'Online Payment' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={cn(
                    'flex items-center gap-3 border p-4 cursor-pointer transition-colors',
                    paymentMethod === opt.id ? 'border-foreground' : 'border-border'
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.id}
                    checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id)}
                    className="accent-highlight"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
              <button
                onClick={onPlaceOrder}
                disabled={placeOrder.isPending}
                className="w-full bg-highlight text-highlight-foreground text-xs uppercase tracking-widest py-4 mt-4 disabled:opacity-50"
              >
                {placeOrder.isPending ? 'PLACING ORDER...' : 'PLACE ORDER →'}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT — Order Summary */}
        <div className="card-trace p-5 sticky top-24 self-start">
          <h3 className="text-[10px] uppercase tracking-widest border-b border-border pb-3 mb-3">ORDER SUMMARY</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex gap-2">
                <div className="w-12 aspect-[3/4] bg-muted flex-shrink-0">
                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">x{item.quantity}</p>
                </div>
                <span className="text-xs font-semibold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-3 pt-3 space-y-1">
            <div className="flex justify-between text-xs"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
            <div className="flex justify-between text-xs"><span>Shipping</span><span>{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span></div>
            <div className="flex justify-between text-sm font-bold border-t border-border pt-2 mt-2">
              <span>TOTAL</span><span>{formatPrice(total + shippingCost)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
