'use client';

import React, { useState, useEffect } from 'react';
import { MapPinned, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { Destination, getDestinations, saveDestinations } from '@/hooks/useDestinations';
import Button from '@/components/ui/Button';

const BADGES = ['None', 'Popular', 'Trending', 'Top Rated'] as const;
type BadgeOption = (typeof BADGES)[number];

interface DestForm {
  name: string;
  subtitle: string;
  imageUrl: string;
  badge: BadgeOption;
}

const emptyForm = (): DestForm => ({ name: '', subtitle: '', imageUrl: '', badge: 'None' });

function formToBadge(b: BadgeOption): Destination['badge'] {
  return b === 'None' ? undefined : b;
}

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DestForm>(emptyForm());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDestinations(getDestinations());
  }, []);

  const startNew = () => {
    setEditingId('__new__');
    setForm(emptyForm());
  };

  const startEdit = (d: Destination) => {
    setEditingId(d.id);
    setForm({
      name: d.name,
      subtitle: d.subtitle,
      imageUrl: d.image,
      badge: d.badge ?? 'None',
    });
  };

  const cancel = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.subtitle.trim() || !form.imageUrl.trim()) return;

    let updated: Destination[];
    if (editingId === '__new__') {
      const newItem: Destination = {
        id: Date.now().toString(),
        name: form.name.trim(),
        subtitle: form.subtitle.trim(),
        image: form.imageUrl.trim(),
        badge: formToBadge(form.badge),
      };
      updated = [...destinations, newItem];
    } else {
      updated = destinations.map((d) =>
        d.id === editingId
          ? {
              ...d,
              name: form.name.trim(),
              subtitle: form.subtitle.trim(),
              image: form.imageUrl.trim(),
              badge: formToBadge(form.badge),
            }
          : d
      );
    }
    saveDestinations(updated);
    setDestinations(updated);
    setEditingId(null);
    setForm(emptyForm());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this destination?')) return;
    const updated = destinations.filter((d) => d.id !== id);
    saveDestinations(updated);
    setDestinations(updated);
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <MapPinned className="h-6 w-6 text-[#FF6B00]" /> Popular Destinations
          </h1>
          <p className="mt-1 text-sm text-gray-500">Manage destinations shown on the homepage</p>
        </div>
        <Button variant="primary" onClick={startNew} disabled={editingId !== null}>
          <Plus className="h-4 w-4" /> Add New
        </Button>
      </div>

      {saved && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          ✓ Destinations saved successfully
        </div>
      )}

      {/* Inline Form */}
      {editingId !== null && (
        <div className="mb-6 rounded-xl border border-[#FF6B00]/30 bg-orange-50 p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            {editingId === '__new__' ? 'Add New Destination' : 'Edit Destination'}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Name *</label>
              <input
                type="text"
                placeholder="e.g. Manali"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
              />
            </div>
            {/* Subtitle */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Subtitle *</label>
              <input
                type="text"
                placeholder="e.g. Himachal Pradesh"
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
              />
            </div>
            {/* Badge */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Badge</label>
              <select
                value={form.badge}
                onChange={(e) =>
                  setForm((f) => ({ ...f, badge: e.target.value as BadgeOption }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
              >
                {BADGES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            {/* Image URL */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Image URL *</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
              />
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="preview"
                  className="mt-2 h-12 w-20 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button variant="primary" onClick={handleSave}>
              <Save className="h-4 w-4" /> Save
            </Button>
            <Button variant="ghost" onClick={cancel}>
              <X className="h-4 w-4" /> Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="w-14 px-3 py-3" />
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Subtitle
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Badge
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {destinations.map((d) => (
                <tr key={d.id} className="transition-colors hover:bg-gray-50">
                  {/* Thumbnail */}
                  <td className="px-3 py-3">
                    <img
                      src={d.image}
                      alt={d.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  </td>
                  {/* Name */}
                  <td className="px-4 py-3 font-semibold text-gray-900">{d.name}</td>
                  {/* Subtitle */}
                  <td className="px-4 py-3 text-gray-500">{d.subtitle}</td>
                  {/* Badge */}
                  <td className="px-4 py-3">
                    {d.badge ? (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          d.badge === 'Popular'
                            ? 'bg-orange-50 text-orange-700'
                            : d.badge === 'Trending'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-green-50 text-green-700'
                        }`}
                      >
                        {d.badge}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => startEdit(d)}
                        disabled={editingId !== null}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        disabled={editingId !== null}
                        className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {destinations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                    No destinations yet. Click &quot;Add New&quot; to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
