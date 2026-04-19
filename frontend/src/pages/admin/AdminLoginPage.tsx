import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminLogin } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
});

type Inputs = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const login = useAdminLogin();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Inputs) => {
    try {
      await login.mutateAsync(data);
      toast.success('Welcome, Admin!');
      navigate('/admin', { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="max-w-sm w-full border border-primary-foreground/10 p-8">
        <div className="text-center border-b border-primary-foreground/10 pb-6 mb-6">
          <h1 className="font-display text-4xl text-primary-foreground">
            TRACE<span className="text-highlight" style={{ fontSize: '80%' }}>™</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-primary-foreground/30 mt-1">ADMIN</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-primary-foreground/50 block mb-1">Email</label>
            <input
              {...register('email')}
              className="bg-transparent border-b border-primary-foreground/20 text-primary-foreground text-sm py-2 w-full outline-none focus:border-highlight"
            />
            {errors.email && <p className="text-[10px] text-destructive mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-primary-foreground/50 block mb-1">Password</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPw ? 'text' : 'password'}
                className="bg-transparent border-b border-primary-foreground/20 text-primary-foreground text-sm py-2 w-full outline-none focus:border-highlight pr-8"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-0 top-2.5 text-primary-foreground/40">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-destructive mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={login.isPending} className="w-full bg-highlight text-highlight-foreground text-xs uppercase tracking-widest py-3 disabled:opacity-50">
            {login.isPending ? 'LOADING...' : 'LOGIN →'}
          </button>
        </form>

        <Link to="/" className="block text-center text-[10px] text-primary-foreground/30 mt-4 hover:text-primary-foreground/60">
          ← BACK TO STORE
        </Link>
      </div>
    </div>
  );
}
