import { useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useAdmin';
import { useState } from 'react';
import { toast } from 'sonner';
import { ApiCategory } from '@/types';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<ApiCategory>>({ category_name: '', description: '', image_url: '' });

  const handleEdit = (cat: ApiCategory) => {
    setFormData(cat);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setFormData({ category_name: '', description: '', image_url: '' });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ category_name: '', description: '', image_url: '' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_name?.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (formData.category_id) {
        await updateCategory.mutateAsync({
          id: formData.category_id,
          category_name: formData.category_name,
          description: formData.description,
          image_url: formData.image_url,
        });
        toast.success('Category updated successfully');
      } else {
        await createCategory.mutateAsync({
          category_name: formData.category_name,
          description: formData.description,
          image_url: formData.image_url,
        });
        toast.success('Category created successfully');
      }
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this category? Make sure no products are using it.')) {
      try {
        await deleteCategory.mutateAsync(id);
        toast.success('Category deleted successfully');
      } catch (err: any) {
        toast.error(err.response?.data?.error?.message || 'Failed to delete category');
      }
    }
  };

  if (isEditing) {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-5xl">{formData.category_id ? 'EDIT CATEGORY' : 'ADD CATEGORY'}</h1>
          <button onClick={handleCancel} className="p-2 hover:bg-muted/50 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="card-trace p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Name *</label>
              <input
                value={formData.category_name || ''}
                onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                className="input-trace"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Image URL</label>
              <input
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="input-trace"
                placeholder="https://..."
              />
              {formData.image_url && (
                <div className="mt-2 w-32 h-32 border border-border">
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-foreground/55 block mb-1">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-trace border border-input p-2 mt-1 min-h-[100px]"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={createCategory.isPending || updateCategory.isPending}
            className="btn-primary py-3 w-full"
          >
            {createCategory.isPending || updateCategory.isPending ? 'SAVING...' : 'SAVE CATEGORY'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-5xl">CATEGORIES</h1>
        <button onClick={handleAddNew} className="btn-primary flex items-center gap-2 px-6 py-2">
          <Plus className="w-4 h-4" /> ADD CATEGORY
        </button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="card-trace overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Image', 'ID', 'Name', 'Description', 'Actions'].map((h) => (
                  <th key={h} className="text-[10px] uppercase tracking-widest text-muted-foreground py-3 px-4 text-left font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories?.map((c) => (
                <tr key={c.category_id} className="border-b border-border hover:bg-muted/20">
                  <td className="py-3 px-4 w-16">
                    {c.image_url ? (
                      <div className="w-12 h-12 bg-muted/30 border border-border overflow-hidden">
                        <img src={c.image_url} alt={c.category_name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-muted/30 border border-border flex items-center justify-center text-[10px] text-muted-foreground">
                        NONE
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">{c.category_id}</td>
                  <td className="py-3 px-4 font-medium">{c.category_name}</td>
                  <td className="py-3 px-4 text-muted-foreground truncate max-w-[200px]">{c.description || '-'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleEdit(c)} className="text-muted-foreground hover:text-foreground relative group">
                        <Pencil className="w-4 h-4" />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
                      </button>
                      <button onClick={() => handleDelete(c.category_id)} className="text-muted-foreground hover:text-destructive relative group">
                        <Trash2 className="w-4 h-4" />
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories?.length === 0 && (
             <div className="p-8 text-center text-muted-foreground text-sm">
               No categories found. Click "Add Category" to create one.
             </div>
          )}
        </div>
      )}
    </div>
  );
}
