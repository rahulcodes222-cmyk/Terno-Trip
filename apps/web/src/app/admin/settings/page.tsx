'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Save, CheckCircle, Image as ImageIcon, FileText, Shield, RefreshCw } from 'lucide-react';
import { getSiteSettings, saveSiteSettings, DEFAULT_SETTINGS } from '@/lib/site-settings';
import Button from '@/components/ui/Button';
import apiClient from '@/lib/api-client';

type Tab = 'logo' | 'terms' | 'privacy' | 'cancellation';

export default function AdminSettingsPage() {
  const [tab, setTab]                     = useState<Tab>('logo');
  const [settings, setSettings]           = useState(getSiteSettings());
  const [saved, setSaved]                 = useState(false);
  const [logoPreview, setLogoPreview]     = useState<string>('');
  const fileRef                           = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = getSiteSettings();
    setSettings(s);
    setLogoPreview(s.logoUrl);
  }, []);

  const handleSave = async () => {
    saveSiteSettings(settings);

    // Sync logo + siteName to notification-service so email templates pick it up
    try {
      await apiClient.post('/api/v1/admin/notifications/brand', {
        logoUrl: settings.logoUrl,
        siteName: settings.siteName,
      });
    } catch {
      // best-effort — don't block save if notification-service is unreachable
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLogoPreview(dataUrl);
      setSettings((s) => ({ ...s, logoUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUrl = (url: string) => {
    setLogoPreview(url);
    setSettings((s) => ({ ...s, logoUrl: url }));
  };

  const resetToDefault = (key: 'termsContent' | 'privacyContent') => {
    setSettings((s) => ({ ...s, [key]: DEFAULT_SETTINGS[key] }));
  };

  const TABS = [
    { key: 'logo'    as Tab, label: 'Logo',            icon: ImageIcon  },
    { key: 'terms'   as Tab, label: 'Terms & Conditions', icon: FileText },
    { key: 'privacy' as Tab, label: 'Privacy Policy',  icon: Shield     },
    { key: 'cancellation' as Tab, label: 'Cancellation Policy', icon: FileText },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage logo, terms, and privacy policy</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-sm font-medium text-green-700">
            <CheckCircle className="h-4 w-4" /> Settings saved!
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-gray-100 p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {/* ── Logo Tab ─────────────────────────────────────────────────── */}
      {tab === 'logo' && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-1 font-semibold text-gray-900">Website Logo</h2>
          <p className="mb-5 text-sm text-gray-500">Upload a new logo or paste an image URL. Changes are saved immediately.</p>

          {/* Current logo preview */}
          <div className="mb-6 flex items-center gap-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-5">
            <div className="flex h-16 w-24 items-center justify-center rounded-xl bg-white shadow-sm overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain p-1" />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-300" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Current Logo</p>
              <p className="text-xs text-gray-400 truncate max-w-xs">
                {logoPreview ? (logoPreview.startsWith('data:') ? 'Uploaded file' : logoPreview) : 'No logo set'}
              </p>
            </div>
          </div>

          {/* Upload file */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Upload Image File</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 py-8 transition-colors hover:border-[#FF6B00] hover:bg-orange-50"
            >
              <Upload className="h-8 w-8 text-gray-300" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Click to upload logo</p>
                <p className="text-xs text-gray-400">PNG, JPG, SVG, WebP — max 2MB</p>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
          </div>

          {/* OR URL input */}
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Or Paste Image URL</label>
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              value={logoPreview.startsWith('data:') ? '' : logoPreview}
              onChange={(e) => handleLogoUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
            />
          </div>

          {/* Other settings */}
          <div className="border-t pt-5 space-y-4">
            <h3 className="font-medium text-gray-800">Site Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Site Name</label>
                <input type="text" value={settings.siteName}
                  onChange={(e) => setSettings(s => ({ ...s, siteName: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Support Email</label>
                <input type="email" value={settings.supportEmail}
                  onChange={(e) => setSettings(s => ({ ...s, supportEmail: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Support Phone</label>
                <input type="text" value={settings.supportPhone}
                  onChange={(e) => setSettings(s => ({ ...s, supportPhone: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]" />
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button variant="primary" onClick={handleSave}>
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* ── Terms Tab ─────────────────────────────────────────────────── */}
      {tab === 'terms' && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Terms &amp; Conditions</h2>
              <p className="text-sm text-gray-500">Shown at <strong>/terms</strong> — edit using Markdown</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => resetToDefault('termsContent')}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                <RefreshCw className="h-3.5 w-3.5" /> Reset to Default
              </button>
              <a href="/terms" target="_blank"
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                Preview ↗
              </a>
            </div>
          </div>

          <div className="mb-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700">
            💡 Use Markdown: <code className="bg-blue-100 px-1 rounded"># Heading</code>, <code className="bg-blue-100 px-1 rounded">## Section</code>, <code className="bg-blue-100 px-1 rounded">**bold**</code>, <code className="bg-blue-100 px-1 rounded">- list item</code>
          </div>

          <textarea
            value={settings.termsContent}
            onChange={(e) => setSettings((s) => ({ ...s, termsContent: e.target.value }))}
            rows={20}
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-xs leading-relaxed focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00] resize-y"
            placeholder="Write terms & conditions in Markdown..."
          />

          <div className="mt-4 flex justify-end">
            <Button variant="primary" onClick={handleSave}>
              <Save className="h-4 w-4" /> Save Terms
            </Button>
          </div>
        </div>
      )}

      {/* ── Privacy Tab ───────────────────────────────────────────────── */}
      {tab === 'privacy' && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Privacy Policy</h2>
              <p className="text-sm text-gray-500">Shown at <strong>/privacy</strong> — edit using Markdown</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => resetToDefault('privacyContent')}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                <RefreshCw className="h-3.5 w-3.5" /> Reset to Default
              </button>
              <a href="/privacy" target="_blank"
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                Preview ↗
              </a>
            </div>
          </div>

          <div className="mb-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700">
            💡 Use Markdown: <code className="bg-blue-100 px-1 rounded"># Heading</code>, <code className="bg-blue-100 px-1 rounded">## Section</code>, <code className="bg-blue-100 px-1 rounded">**bold**</code>, <code className="bg-blue-100 px-1 rounded">- list item</code>
          </div>

          <textarea
            value={settings.privacyContent}
            onChange={(e) => setSettings((s) => ({ ...s, privacyContent: e.target.value }))}
            rows={20}
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-xs leading-relaxed focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00] resize-y"
            placeholder="Write privacy policy in Markdown..."
          />

          <div className="mt-4 flex justify-end">
            <Button variant="primary" onClick={handleSave}>
              <Save className="h-4 w-4" /> Save Privacy Policy
            </Button>
          </div>
        </div>
      )}

      {/* ── Cancellation Policy Tab ────────────────────────────────────── */}
      {tab === 'cancellation' && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Cancellation Policy</h2>
              <p className="text-sm text-gray-500">Shown in checkout &amp; trip details — edit using Markdown</p>
            </div>
            <div className="flex gap-2">
              <a href="/checkout" target="_blank"
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                Preview (Checkout) ↗
              </a>
            </div>
          </div>

          <div className="mb-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700">
            💡 Use Markdown: <code className="bg-blue-100 px-1 rounded"># Heading</code>, <code className="bg-blue-100 px-1 rounded">## Section</code>, <code className="bg-blue-100 px-1 rounded">**bold**</code>, <code className="bg-blue-100 px-1 rounded">- list item</code>
          </div>

          <textarea
            value={settings.cancellationPolicy || ''}
            onChange={(e) => setSettings((s) => ({ ...s, cancellationPolicy: e.target.value }))}
            rows={20}
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-xs leading-relaxed focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00] resize-y"
            placeholder="Write cancellation policy in Markdown..."
          />

          <div className="mt-4 flex justify-end">
            <Button variant="primary" onClick={handleSave}>
              <Save className="h-4 w-4" /> Save Cancellation Policy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
