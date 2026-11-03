'use client';

import React, { useState, useEffect } from 'react';
import { MapPinned, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { Destination, getDestinations, saveDestinations } from '@/hooks/useDestinations';
import Button from '@/components/ui/Button';

const BADGES = ['None', 'Popular', 'Trending', 'Top Rated'] as const;
type BadgeValue = (typeof BADGES)[number];

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Destination & { badgeValue: BadgeValue }>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDestinations(getDestinations());
  }, []);

  const startNew = () => {
    setEditingId('__new__');
    setForm({ badgeValue: 'None' });
  };

  const startEdit = (d: Destination) => {
    setEditingId(d.id);
    setForm({
      ...d,
      badgeValue: (d.badge ?? 'None') as BadgeValue,
    });
  };

  const cancel = () => {
    setEditingId(null);
    setForm({});
  };

  const handleSave = () => {
    const badge = form.badgeValue === 'None' ? undefined : form.badgeValue as Destination['badge'];
    const record: Destination = {
      id: editingId === '__new__' ? Date.now().toString() : (editingId ?? Date.now().toString()),
      name: form.name ?? '',
      subtitle: form.subtitle ?? '',
      image: form.image ?? '',
      ...(badge ? { badge } : {}),
    };

    let updated: Destination[];
    if (editingId === '__new__') {
      updated = [...destinations, record];
    } else {
      updated = destinations.map((d) => (d.id === editingId ? record : d));
    }

    saveDestinations(updated);
    setDestinations(updated);
    setEditingId(null);
    setForm({});
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this destination?')) return;
    const updated = destinations.filter((d) => d.id !== id);
    saveDestinations(updated);
    setDestinations(updated);
  };

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <MapPinned className="h-6 w-6 text-[#FF6B00]" />
            Popular Destinations
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage destination cards shown on the homepage
          </p>
        </div>
        <Button variant="primary" onClick={startNew}>
          <Plus className="h-4 w-4" /> Add New
        </Button>
      </div>

      {/* Saved feedback */}
      {saved && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700 border border-green-200">
          ✓ Destinations saved successfully
        </div>
      )}

      {/* Inline Add/Edit Form */}
      {editingId !== null && (
        <div className="mb-6 rounded-2xl border border-[#FF6B00]/30 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-900">
            {editingId === '__new__' ? 'Add New Destination' : 'Edit Destination'}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                value={form.name ?? ''}
                onChange={(e) => updateForm('name', e.target.value)}
                placeholder="e.g. Manali"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
              />
            </div>
            {/* Subtitle */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Subtitle *</label>
              <input
                type="text"
                value={form.subtitle ?? ''}
                onChange={(e) => updateForm('subtitle', e.target.value)}
                placeholder="e.g. Himachal Pradesh"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
              />
            </div>
            {/* Image URL */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Image URL *</label>
              <input
                type="text"
                value={form.image ?? ''}
                onChange={(e) => updateForm('image', e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
              />
              {form.image && (
                <img
                  src={form.image}
                  alt="Preview"
                  className="mt-2 h-12 w-20 rounded-lg object-cover"
                />
              )}
            </div>
            {/* Badge */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Badge</label>
              <select
                value={form.badgeValue ?? 'None'}
                onChange={(e) => updateForm('badgeValue', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
              >
                {BADGES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Form actions */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-lg bg-[#FF6B00] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e55f00] transition-colors"
            >
              <Save className="h-4 w-4" /> Save
            </button>
            <button
              type="button"
              onClick={cancel}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Destinations Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        {destinations.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No destinations yet.</div>
        ) : (
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
                {destinations.map((dest) => (
                  <tr key={dest.id} className="transition-colors hover:bg-gray-50">
                    {/* Thumbnail */}
                    <td className="px-3 py-3">
                      <img
                        src={dest.image || 'https://picsum.photos/seed/dest/40/40'}
                        alt={dest.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    </td>
                    {/* Name */}
                    <td className="px-4 py-3 font-semibold text-gray-900">{dest.name}</td>
                    {/* Subtitle */}
                    <td className="px-4 py-3 text-gray-500">{dest.subtitle}</td>
                    {/* Badge */}
                    <td className="px-4 py-3">
                      {dest.badge ? (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            dest.badge === 'Popular'
                              ? 'bg-orange-50 text-orange-700'
                              : dest.badge === 'Trending'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-purple-50 text-purple-700'
                          }`}
                        >
                          {dest.badge}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => startEdit(dest)}
                          className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(dest.id)}
                          className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
