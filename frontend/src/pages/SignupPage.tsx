import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '@/hooks/useAuth';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const schema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  username: z.string().min(3, 'Username must be 3+ chars'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirm_password: z.string(),
  phone_number: z.string().optional(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

type Inputs = z.infer<typeof schema>;

function getStrength(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

export default function SignupPage() {
  const reg = useRegister();
  const navigate = useNavigate();
  const [pw, setPw] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Inputs) => {
    try {
      await reg.mutateAsync({
        username: data.username,
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone_number: data.phone_number,
      });
      toast.success('Account created!');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Registration failed');
    }
  };

  const strength = getStrength(pw);

  return (
    <div className="max-w-sm w-full border border-border bg-card p-8">
      <div className="text-center border-b border-border pb-6 mb-6">
        <h1 className="font-display text-4xl">
          TRACE<span className="text-highlight" style={{ fontSize: '80%' }}>™</span>
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Create your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {[
          { name: 'full_name' as const, label: 'Full Name' },
          { name: 'username' as const, label: 'Username' },
          { name: 'email' as const, label: 'Email' },
        ].map(({ name, label }) => (
          <div key={name}>
            <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">{label}</label>
            <input {...register(name)} className="input-trace" />
            {errors[name] && <p className="text-[10px] uppercase tracking-widest text-destructive mt-1">{errors[name]?.message}</p>}
          </div>
        ))}

        <div>
          <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Password</label>
          <input
            {...register('password')}
            type="password"
            onChange={(e) => {
              setPw(e.target.value);
              register('password').onChange(e);
            }}
            className="input-trace"
          />
          {/* Strength bar */}
          <div className="flex gap-1 mt-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn('h-1 flex-1', i < strength ? 'bg-highlight' : 'bg-muted')}
              />
            ))}
          </div>
          {errors.password && <p className="text-[10px] uppercase tracking-widest text-destructive mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Confirm Password</label>
          <input {...register('confirm_password')} type="password" className="input-trace" />
          {errors.confirm_password && <p className="text-[10px] uppercase tracking-widest text-destructive mt-1">{errors.confirm_password.message}</p>}
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Phone (Optional)</label>
          <input {...register('phone_number')} className="input-trace" />
        </div>

        <button type="submit" disabled={reg.isPending} className="w-full btn-primary py-3">
          {reg.isPending ? 'CREATING...' : 'CREATE ACCOUNT →'}
        </button>
      </form>

      <p className="text-[10px] text-muted-foreground text-center mt-3">
        Already have an account?{' '}
        <Link to="/login" className="text-highlight hover:underline">Login</Link>
      </p>
    </div>
  );
}
