import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLogin } from '@/hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password is required'),
});

type Inputs = z.infer<typeof schema>;

export default function LoginPage() {
  const login = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPw, setShowPw] = useState(false);
  const from = (location.state as { from?: string })?.from || '/';

  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Inputs) => {
    try {
      await login.mutateAsync(data);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-sm w-full border border-border bg-card p-8">
      <div className="text-center border-b border-border pb-6 mb-6">
        <h1 className="font-display text-4xl">
          TRACE<span className="text-highlight" style={{ fontSize: '80%' }}>™</span>
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
          Welcome back
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Email</label>
          <input {...register('email')} className="input-trace" />
          {errors.email && <p className="text-[10px] uppercase tracking-widest text-destructive mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Password</label>
          <div className="relative">
            <input {...register('password')} type={showPw ? 'text' : 'password'} className="input-trace pr-8" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-0 top-2.5 text-muted-foreground">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-[10px] uppercase tracking-widest text-destructive mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
          <Link to="/admin/login" className="hover:text-highlight">
            LOGIN AS ADMIN
          </Link>
          <Link to="/forgot-password" className="hover:text-highlight">
            FORGOT PASSWORD?
          </Link>
        </div>

        <button type="submit" disabled={login.isPending} className="w-full btn-primary py-3">
          {login.isPending ? 'LOADING...' : 'LOGIN →'}
        </button>
        <Link to="/signup" className="block w-full text-center btn-outline py-3">
          CREATE ACCOUNT
        </Link>
      </form>
    </div>
  );
}
