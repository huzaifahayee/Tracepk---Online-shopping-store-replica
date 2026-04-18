import { formatPrice } from '@/lib/utils';
import { useAdminCustomers } from '@/hooks/useAdmin';

export default function CustomersPage() {
  const { data: customers, isLoading } = useAdminCustomers();

  return (
    <div>
      <h1 className="font-display text-5xl mb-6">CUSTOMERS</h1>
      
      {isLoading ? (
        <p className="text-muted-foreground">Loading customers...</p>
      ) : (
        <div className="card-trace overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Name', 'Email', 'Phone', 'Orders', 'Total Spent', 'Joined'].map((h) => (
                  <th key={h} className="text-[10px] uppercase tracking-widest text-muted-foreground py-3 px-4 text-left font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers?.map((c) => (
                <tr key={c.id} className="border-b border-border hover:bg-muted/20">
                  <td className="py-3 px-4 font-medium">{c.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{c.email}</td>
                  <td className="py-3 px-4">{c.phone || '-'}</td>
                  <td className="py-3 px-4">{c.orders}</td>
                  <td className="py-3 px-4">{formatPrice(c.spent)}</td>
                  <td className="py-3 px-4 text-muted-foreground">{new Date(c.joined).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers?.length === 0 && (
             <div className="p-8 text-center text-muted-foreground text-sm">
               No customers found.
             </div>
          )}
        </div>
      )}
    </div>
  );
}
