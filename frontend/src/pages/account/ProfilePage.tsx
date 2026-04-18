import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated!');
  };

  return (
    <div>
      <h1 className="font-display text-4xl mb-6">MY PROFILE</h1>
      <form onSubmit={handleSave} className="max-w-md space-y-5">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-trace" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Email</label>
          <input value={user?.email || ''} readOnly className="input-trace text-muted-foreground" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-trace" />
        </div>
        <button type="submit" className="btn-primary py-3">SAVE CHANGES →</button>
      </form>
    </div>
  );
}
