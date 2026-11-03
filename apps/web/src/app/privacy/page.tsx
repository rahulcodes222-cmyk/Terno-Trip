'use client';

import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { getSiteSettings } from '@/lib/site-settings';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

function renderMarkdown(text: string): string {
  return text
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-extrabold text-gray-900 mb-4 mt-8 first:mt-0">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-gray-900 mb-3 mt-6">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2 mb-1 text-gray-600 text-sm"><span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF6B00]"></span><span>$1</span></li>')
    .replace(/\n\n/g, '</p><p class="text-gray-600 text-sm leading-relaxed mb-4">')
    .replace(/((?:<li.*<\/li>\n?)+)/g, '<ul class="space-y-1 mb-4 pl-2">$1</ul>');
}

export default function PrivacyPage() {
  const [content, setContent] = useState('');
  const [updatedDate, setUpdatedDate] = useState('');

  useEffect(() => {
    const s = getSiteSettings();
    setContent(s.privacyContent);
    const match = s.privacyContent.match(/\*\*Last updated:\*\* (.+)/);
    if (match) setUpdatedDate(match[1]);

    const handler = () => {
      const fresh = getSiteSettings();
      setContent(fresh.privacyContent);
    };
    window.addEventListener('site-settings-updated', handler);
    return () => window.removeEventListener('site-settings-updated', handler);
  }, []);

  return (
    <PageLayout>
      <div className="bg-[#F5F7FA] min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">

          <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#FF6B00] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <div className="mb-6 flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Shield className="h-6 w-6 text-[#1B2E6B]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">Privacy Policy</h1>
              {updatedDate && <p className="text-xs text-gray-400">Last updated: {updatedDate}</p>}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <div
              className="prose-sm max-w-none text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          </div>

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
            Privacy concerns? Email us at{' '}
            <a href="mailto:privacy@ternotrip.com" className="font-semibold underline">
              privacy@ternotrip.com
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
