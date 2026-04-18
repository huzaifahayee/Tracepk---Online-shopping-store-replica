import { useState } from 'react';
import { toast } from 'sonner';

export default function AddressesPage() {
  const [addresses] = useState([
    { id: 1, label: 'Home', address: 'House 5, Model Town, Lahore', isDefault: true },
  ]);

  return (
    <div>
      <h1 className="font-display text-4xl mb-6">MY ADDRESSES</h1>
      <div className="space-y-3 max-w-md">
        {addresses.map((addr) => (
          <div key={addr.id} className="card-trace p-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{addr.label}</p>
                {addr.isDefault && (
                  <span className="text-[9px] uppercase tracking-widest bg-highlight text-highlight-foreground px-2 py-0.5">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{addr.address}</p>
            </div>
            <div className="flex gap-2">
              <button className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">Edit</button>
              <button className="text-[10px] uppercase tracking-widest text-destructive">Delete</button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => toast.info('Address form coming soon!')} className="btn-outline py-2 mt-4">
        ADD NEW ADDRESS →
      </button>
    </div>
  );
}
