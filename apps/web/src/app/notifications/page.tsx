'use client';

import React from 'react';
import { formatDate } from '@/lib/utils';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PageLayout from '@/components/layout/PageLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import { useNotifications, useMarkRead, useMarkAllRead } from '@/hooks/useNotifications';
import { useState } from 'react';

function typeIcon(type: string) {
  if (type === 'booking') return '📦';
  if (type === 'payment') return '💳';
  return '🔔';
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}

function NotificationsContent() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useNotifications(page);
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const notifications = data?.data ?? [];
  const pagination = data?.pagination;
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {hasUnread && (
            <Button
              variant="secondary"
              size="sm"
              loading={markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <LoadingSpinner fullPage />
        ) : notifications.length === 0 ? (
          <EmptyState icon="🔔" title="No notifications" message="You're all caught up!" />
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => !n.read && markRead.mutate(n._id)}
                className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                  n.read
                    ? 'border-gray-100 bg-white'
                    : 'border-orange-100 bg-orange-50 border-l-4 border-l-primary'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{typeIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {n.title}
                      </p>
                      <span className="shrink-0 text-xs text-gray-400">
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">{n.message}</p>
                  </div>
                  {!n.read && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#FF6B00]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </PageLayout>
  );
}
