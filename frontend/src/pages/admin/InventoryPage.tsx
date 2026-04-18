import { cn } from '@/lib/utils';
import { useAdminProducts, useUpdateProduct } from '@/hooks/useAdmin';
import { useState } from 'react';
import { toast } from 'sonner';

export default function InventoryPage() {
  const { data: products, isLoading } = useAdminProducts();
  const updateProduct = useUpdateProduct();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [stockValue, setStockValue] = useState<number>(0);

  const handleEditClick = (product: any) => {
    setEditingId(product.product_id);
    setStockValue(product.stock_quantity);
  };

  const handleSave = async (product: any) => {
    try {
      await updateProduct.mutateAsync({
        id: product.product_id,
        category_id: product.category_id,
        product_name: product.product_name,
        price: product.price,
        stock_quantity: stockValue,
        description: product.description,
        size: product.size,
        color: product.color,
        image_url: product.image_url,
      });
      toast.success('Stock updated');
      setEditingId(null);
    } catch {
      toast.error('Failed to update stock');
    }
  };

  return (
    <div>
      <h1 className="font-display text-5xl mb-6">INVENTORY</h1>

      {isLoading ? (
        <p className="text-muted-foreground">Loading inventory...</p>
      ) : (
        <div className="card-trace overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Product', 'Size', 'Color', 'Stock', 'Actions'].map((h) => (
                  <th key={h} className="text-[10px] uppercase tracking-widest text-muted-foreground py-3 px-4 text-left font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products?.map((item) => (
                <tr
                  key={item.product_id}
                  className={cn('border-b border-border', item.stock_quantity < 5 && 'bg-highlight/5')}
                >
                  <td className="py-3 px-4 font-medium">{item.product_name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{item.size || '-'}</td>
                  <td className="py-3 px-4 text-muted-foreground">{item.color || '-'}</td>
                  <td className="py-3 px-4">
                    {editingId === item.product_id ? (
                      <input
                        type="number"
                        min="0"
                        className="w-16 bg-transparent border-b border-border outline-none focus:border-highlight text-center"
                        value={stockValue}
                        onChange={(e) => setStockValue(Number(e.target.value))}
                      />
                    ) : (
                      <span className={cn(item.stock_quantity === 0 ? 'text-destructive font-bold' : item.stock_quantity < 5 ? 'text-highlight font-bold' : '')}>
                        {item.stock_quantity}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === item.product_id ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleSave(item)} className="text-[10px] uppercase tracking-widest text-highlight hover:underline">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-[10px] uppercase tracking-widest text-muted-foreground hover:underline">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => handleEditClick(item)} className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">Update</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
