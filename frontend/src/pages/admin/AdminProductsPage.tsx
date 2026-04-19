import { useState } from 'react';
import { useAdminProducts, useAdminCategories, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useAdmin';
import { formatPrice } from '@/lib/utils';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import type { ApiProduct } from '@/types';

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ApiProduct | null>(null);
  const { data: products, isLoading } = useAdminProducts(search);
  const { data: categories } = useAdminCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [form, setForm] = useState({
    product_name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    size: '',
    color: '',
    image_url: '',
  });

  const openCreate = () => {
    setEditProduct(null);
    setForm({ product_name: '', description: '', price: '', stock_quantity: '', category_id: categories?.[0]?.category_id?.toString() || '', size: '', color: '', image_url: '' });
    setModalOpen(true);
  };

  const openEdit = (p: ApiProduct) => {
    setEditProduct(p);
    setForm({
      product_name: p.product_name,
      description: p.description || '',
      price: p.price.toString(),
      stock_quantity: p.stock_quantity.toString(),
      category_id: p.category_id.toString(),
      size: p.size || '',
      color: p.color || '',
      image_url: p.image_url || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      product_name: form.product_name,
      description: form.description || undefined,
      price: Number(form.price),
      stock_quantity: Number(form.stock_quantity),
      category_id: Number(form.category_id),
      size: form.size || undefined,
      color: form.color || undefined,
      image_url: form.image_url || undefined,
    };

    try {
      if (editProduct) {
        await updateProduct.mutateAsync({ id: editProduct.product_id, ...body });
        toast.success('Product updated!');
      } else {
        await createProduct.mutateAsync(body);
        toast.success('Product created!');
      }
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this product?')) {
      try {
        await deleteProduct.mutateAsync(id);
        toast.success('Product deleted');
      } catch {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-5xl">PRODUCTS</h1>
        <button onClick={openCreate} className="btn-primary py-2 px-4">ADD PRODUCT →</button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className="input-trace max-w-sm mb-6"
      />

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="card-trace overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Image', 'Name', 'Category', 'Price', 'Stock', 'Actions'].map((h) => (
                  <th key={h} className="text-[10px] uppercase tracking-widest text-muted-foreground py-3 px-4 text-left font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products?.map((p) => (
                <tr key={p.product_id} className="border-b border-border hover:bg-muted/20">
                  <td className="py-2 px-4">
                    <div className="w-12 h-12 bg-muted">
                      {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                  </td>
                  <td className="py-2 px-4 font-medium">{p.product_name}</td>
                  <td className="py-2 px-4 text-muted-foreground">{p.category_name}</td>
                  <td className="py-2 px-4">{formatPrice(p.price)}</td>
                  <td className="py-2 px-4">
                    <span className={p.stock_quantity < 5 ? 'text-highlight font-bold' : ''}>{p.stock_quantity}</span>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">Edit</button>
                      <button onClick={() => handleDelete(p.product_id)} className="text-[10px] uppercase tracking-widest text-destructive">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-[199]" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="bg-card border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-2xl">{editProduct ? 'EDIT PRODUCT' : 'ADD PRODUCT'}</h2>
                  <button onClick={() => setModalOpen(false)}><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { key: 'product_name', label: 'Product Name', type: 'text', required: true },
                    { key: 'description', label: 'Description', type: 'text', required: false },
                    { key: 'price', label: 'Price', type: 'number', required: true },
                    { key: 'stock_quantity', label: 'Stock Quantity', type: 'number', required: true },
                    { key: 'size', label: 'Size', type: 'text', required: false },
                    { key: 'color', label: 'Color', type: 'text', required: false },
                    { key: 'image_url', label: 'Image URL', type: 'text', required: false },
                  ].map(({ key, label, type, required }) => (
                    <div key={key}>
                      <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">{label}</label>
                      <input
                        type={type}
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        required={required}
                        className="input-trace"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Category</label>
                    <select
                      value={form.category_id}
                      onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                      className="input-trace"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories?.map((c) => (
                        <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="w-full btn-primary py-3">
                    {editProduct ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
