import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [storeName, setStoreName] = useState('TRACE™');
  const [announcement, setAnnouncement] = useState('');
  const [currency, setCurrency] = useState('PKR');

  useEffect(() => {
    if (settings) {
      setAnnouncement(settings.announcement_text || '');
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync({
        announcement_text: announcement,
      });
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    }
  };

  if (isLoading) return <p className="text-muted-foreground p-5">Loading...</p>;

  return (
    <div>
      <h1 className="font-display text-5xl mb-6">SETTINGS</h1>
      <form onSubmit={handleSave} className="max-w-lg space-y-6">
        <div className="card-trace p-5 space-y-4">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground">GENERAL</h3>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Store Name</label>
            <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="input-trace" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Currency</label>
            <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-trace" />
          </div>
        </div>

        <div className="card-trace p-5 space-y-4">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground">ANNOUNCEMENT BAR</h3>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Text</label>
            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              rows={3}
              placeholder="Leave empty to hide announcement bar"
              className="input-trace border border-input p-2 resize-none"
            />
          </div>
        </div>

        <div className="card-trace p-5 space-y-4">
          <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground">SHIPPING (Coming Soon)</h3>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Free Shipping Threshold</span><span>Rs.10,000</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Standard Shipping Rate</span><span>Rs.200</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Express Shipping Rate</span><span>Rs.400</span></div>
        </div>

        <button type="submit" disabled={updateSettings.isPending} className="btn-primary py-3">
          {updateSettings.isPending ? 'SAVING...' : 'SAVE SETTINGS →'}
        </button>
      </form>
    </div>
  );
}
