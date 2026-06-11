import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Card } from '../../../components/ui/Card';
import { useAdminData } from '../hooks/useAdminData';
import type { Category, CategoryPayload } from '../../../types/domain';

const emptyForm: CategoryPayload = {
  name: '',
  description: '',
  isActive: true,
};

export function AdminCategoriesPage() {
  const { categories, deleteCategory, error, isSaving, upsertCategory } = useAdminData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<CategoryPayload>(emptyForm);

  const openCreate = () => {
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setForm(category);
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await upsertCategory(form);
      setIsModalOpen(false);
    } catch {
      return;
    }
  };

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Kategori Menu</h2>
            <p className="mt-1 text-sm text-slate-500">Atur pengelompokan menu yang muncul di halaman customer.</p>
          </div>
          <Button onClick={openCreate} className="h-11 w-full md:w-auto" disabled={isSaving}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Kategori
          </Button>
        </div>
        {error ? <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Kategori</th>
                <th className="px-4 py-3 font-bold">Deskripsi</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-950">{category.name}</td>
                  <td className="px-4 py-3 text-slate-600">{category.description}</td>
                  <td className="px-4 py-3">
                    <Badge variant={category.isActive ? 'success' : 'secondary'}>
                      {category.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(category)} aria-label={`Edit ${category.name}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="dangerGhost" size="icon" onClick={() => void deleteCategory(category.id)} aria-label={`Nonaktifkan ${category.name}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={form.id ? 'Ubah Kategori' : 'Tambah Kategori'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nama Kategori</label>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Deskripsi</label>
            <Input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600"
            />
            Kategori aktif
          </label>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Menyimpan...' : 'Simpan'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
