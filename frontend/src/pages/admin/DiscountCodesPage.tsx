import { cn } from '@/lib/utils';

const codes = [
  { code: 'TRACE10', type: '%', value: 10, uses: 47, expiry: '2025-06-30', active: true },
  { code: 'SUMMER25', type: '%', value: 25, uses: 12, expiry: '2025-05-31', active: true },
  { code: 'FLAT500', type: 'Rs.', value: 500, uses: 89, expiry: '2025-04-30', active: false },
];

export default function DiscountCodesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-5xl">DISCOUNT CODES</h1>
        <button className="btn-primary py-2 px-4">ADD CODE →</button>
      </div>
      <div className="card-trace overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Code', 'Type', 'Value', 'Uses', 'Expiry', 'Active'].map((h) => (
                <th key={h} className="text-[10px] uppercase tracking-widest text-muted-foreground py-3 px-4 text-left font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.code} className="border-b border-border hover:bg-muted/20">
                <td className="py-3 px-4 font-mono font-bold">{c.code}</td>
                <td className="py-3 px-4">{c.type}</td>
                <td className="py-3 px-4">{c.type === '%' ? `${c.value}%` : `Rs.${c.value}`}</td>
                <td className="py-3 px-4">{c.uses}</td>
                <td className="py-3 px-4 text-muted-foreground">{c.expiry}</td>
                <td className="py-3 px-4">
                  <span className={cn('text-[9px] uppercase tracking-widest px-2 py-0.5', c.active ? 'bg-highlight text-highlight-foreground' : 'bg-muted text-muted-foreground')}>
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
