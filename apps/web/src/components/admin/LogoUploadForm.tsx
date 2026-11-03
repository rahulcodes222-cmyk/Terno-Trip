import React, { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export default function LogoUploadForm() {
  const { settings, refresh } = useSettings();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      // The API will store the file and update SiteSettings.logoUrl
      const response = await fetch('/api/v1/admin/settings', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }
      // Refresh context to get the new logo URL
      refresh();
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-8 rounded-lg bg-white/5 p-6 backdrop-blur-md">
      <h2 className="mb-4 text-lg font-semibold text-white">Site Logo Upload</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="rounded border border-gray-300 bg-gray-700 text-white file:mr-4 file:rounded file:border-0 file:bg-orange-600 file:px-2 file:py-1 file:text-sm file:font-semibold file:text-white hover:file:bg-orange-500"
        />
        <button
          type="submit"
          disabled={uploading}
          className="rounded bg-orange-600 px-4 py-2 font-bold text-white hover:bg-orange-500 disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Upload Logo'}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {settings?.logoUrl && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-300">Current logo:</span>
            <img src={settings.logoUrl} alt="Site logo" className="h-8 w-auto" />
          </div>
        )}
      </form>
    </div>
  );
}
