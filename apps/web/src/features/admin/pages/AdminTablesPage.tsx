import React, { useState } from 'react';
import type { FormEvent } from 'react';
import {QRCode} from 'react-qr-code';
import type { QRCodeProps } from 'react-qr-code';
import { Edit, Plus, Printer, QrCode } from 'lucide-react';
import { toPublicUrl } from '../../../app/config/app';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Card } from '../../../components/ui/Card';
import { useAdminData } from '../hooks/useAdminData';
import type { CafeTable, TablePayload } from '../../../types/domain';

const QRCodeView = QRCode as React.ComponentType<QRCodeProps>;

const emptyForm: TablePayload = {
  tableNumber: '',
  qrCode: '',
  isActive: true,
};

export function AdminTablesPage() {
  const { error, isSaving, tables, upsertTable } = useAdminData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<CafeTable | null>(null);
  const [form, setForm] = useState<TablePayload>(emptyForm);

  const openCreate = () => {
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (table: CafeTable) => {
    setForm(table);
    setIsFormOpen(true);
  };

  const openQr = (table: CafeTable) => {
    setSelectedTable(table);
    setIsQrOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await upsertTable(form);
      setIsFormOpen(false);
    } catch {
      return;
    }
  };

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Manajemen Meja & QR</h2>
            <p className="mt-1 text-sm text-slate-500">Atur meja dan QR yang dipakai pelanggan untuk memesan.</p>
          </div>
          <Button onClick={openCreate} className="h-11 w-full md:w-auto" disabled={isSaving}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Meja
          </Button>
        </div>
        {error ? <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">No. Meja</th>
                <th className="px-4 py-3 font-bold">QR Code</th>
                <th className="px-4 py-3 font-bold">URL</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 text-right font-bold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tables.map((table) => (
                <tr key={table.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-950">{table.tableNumber}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{table.qrCode}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{table.qrUrl}</td>
                  <td className="px-4 py-3">
                    <Badge variant={table.isActive ? 'success' : 'secondary'}>
                      {table.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openQr(table)}>
                        <QrCode className="mr-2 h-4 w-4" /> QR
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(table)} aria-label={`Edit ${table.tableNumber}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={form.id ? 'Ubah Meja' : 'Tambah Meja'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nomor Meja</label>
            <Input
              value={form.tableNumber}
              onChange={(event) => setForm({ ...form, tableNumber: event.target.value })}
              placeholder="M-05"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">QR Code ID</label>
            <Input
              value={form.qrCode}
              onChange={(event) => setForm({ ...form, qrCode: event.target.value })}
              placeholder="Otomatis jika dikosongkan"
            />
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600"
            />
            Meja aktif dan dapat digunakan
          </label>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Batal</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Menyimpan...' : 'Simpan Data Meja'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} title="Preview QR Meja">
        {selectedTable ? (
          <div className="text-center">
            <div className="mx-auto w-fit rounded-xl border border-slate-200 bg-white p-4">
              <QRCodeView value={toPublicUrl(selectedTable.qrUrl)} size={180} />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-950">{selectedTable.tableNumber}</h3>
            <p className="mt-1 font-mono text-sm text-slate-500">{selectedTable.qrCode}</p>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              {selectedTable.qrUrl}
            </p>
            <Button className="mt-5 w-full" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Cetak QR
            </Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
