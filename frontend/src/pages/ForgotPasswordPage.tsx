import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    toast.success('If an account exists, a reset link has been sent.');
  };

  return (
    <div className="max-w-sm w-full border border-border bg-card p-8">
      <div className="text-center border-b border-border pb-6 mb-6">
        <h1 className="font-display text-4xl">
          TRACE<span className="text-highlight" style={{ fontSize: '80%' }}>™</span>
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Reset your password</p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-trace"
              required
            />
          </div>
          <button type="submit" className="w-full btn-primary py-3">SEND RESET LINK →</button>
          <Link to="/login" className="block text-center text-[10px] text-muted-foreground hover:text-highlight">
            BACK TO LOGIN
          </Link>
        </form>
      ) : (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Check your email for a reset link.</p>
          <Link to="/login" className="btn-primary mt-4 inline-block">BACK TO LOGIN</Link>
        </div>
      )}
    </div>
  );
}
