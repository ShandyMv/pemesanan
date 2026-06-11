import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { Edit, Image as ImageIcon, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Card } from '../../../components/ui/Card';
import { formatCurrency } from '../../../lib/utils';
import { useAdminData } from '../hooks/useAdminData';
import type { Menu, MenuPayload } from '../../../types/domain';

const emptyForm: MenuPayload = {
  name: '',
  categoryId: '',
  price: '',
  description: '',
  imageUrl: '',
  isAvailable: true,
};

export function AdminMenusPage() {
  const { categories, deleteMenu, error, isSaving, menus, upsertMenu } = useAdminData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<MenuPayload>(emptyForm);

  const filteredMenus = menus.filter((menu) => menu.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const openCreate = () => {
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (menu: Menu) => {
    setForm(menu);
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await upsertMenu({
        ...form,
        imageUrl: form.imageUrl || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80',
      });
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
            <h2 className="text-xl font-bold text-slate-950">Manajemen Menu</h2>
            <p className="mt-1 text-sm text-slate-500">Atur menu yang dapat dipesan pelanggan.</p>
          </div>
          <Button onClick={openCreate} className="h-11 w-full md:w-auto" disabled={isSaving}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Menu
          </Button>
        </div>
        {error ? <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}
        <div className="relative mt-4 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Cari nama menu"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Menu</th>
                <th className="px-4 py-3 font-bold">Kategori</th>
                <th className="px-4 py-3 font-bold">Harga</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMenus.map((menu) => {
                const category = categories.find((item) => item.id === menu.categoryId);
                return (
                  <tr key={menu.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={menu.imageUrl} alt={menu.name} className="h-12 w-12 rounded-xl object-cover" />
                        <div>
                          <p className="font-bold text-slate-950">{menu.name}</p>
                          <p className="line-clamp-1 max-w-xs text-xs text-slate-500">{menu.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{category?.name || '-'}</td>
                    <td className="px-4 py-3 font-bold text-primary-700">{formatCurrency(menu.price)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={menu.isAvailable ? 'success' : 'destructive'}>
                        {menu.isAvailable ? 'Tersedia' : 'Habis'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(menu)} aria-label={`Edit ${menu.name}`}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="dangerGhost" size="icon" onClick={() => void deleteMenu(menu.id)} aria-label={`Nonaktifkan ${menu.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={form.id ? 'Ubah Menu' : 'Tambah Menu'} className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nama Menu</label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Kategori</label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                value={form.categoryId}
                onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                required
              >
                <option value="">Pilih kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Harga</label>
              <Input type="number" min="1" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Tautan gambar</label>
              <Input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="Opsional" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Deskripsi Singkat</label>
            <textarea
              className="min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              required
            />
          </div>

          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
            <ImageIcon className="mx-auto h-7 w-7 text-slate-400" />
            <p className="mt-2 text-sm font-semibold text-slate-700">Gambar menu</p>
            <p className="text-xs text-slate-500">Kosongkan jika ingin memakai gambar bawaan.</p>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(event) => setForm({ ...form, isAvailable: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600"
            />
            Menu tersedia untuk dipesan
          </label>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Menyimpan...' : 'Simpan Menu'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
