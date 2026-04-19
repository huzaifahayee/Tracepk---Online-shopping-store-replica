import { useState } from 'react';
import { toast } from 'sonner';

export default function ChangePasswordPage() {
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirm) { toast.error("Passwords don't match"); return; }
    if (newPw.length < 8) { toast.error('Minimum 8 characters'); return; }
    toast.success('Password changed!');
    setCurrent(''); setNewPw(''); setConfirm('');
  };

  return (
    <div>
      <h1 className="font-display text-4xl mb-6">CHANGE PASSWORD</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-5">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Current Password</label>
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className="input-trace" required />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">New Password</label>
          <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="input-trace" required />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Confirm New Password</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input-trace" required />
        </div>
        <button type="submit" className="btn-primary py-3">UPDATE PASSWORD →</button>
      </form>
    </div>
  );
}
