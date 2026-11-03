import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Users, MapPin } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { IBooking } from '@/types';

interface BookingCardProps {
  booking: IBooking;
  onCancel?: (id: string) => void;
}

function formatCancelledDate(dateStr: string): string {
  const date = new Date(dateStr);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const hour12 = date.getHours() % 12 === 0 ? 12 : date.getHours() % 12;
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `Cancelled at ${String(hour12).padStart(2, '0')}:${minutes} ${ampm} on ${day} ${month} ${year}`;
}

export default function BookingCard({ booking, onCancel }: BookingCardProps) {
  const canCancel = booking.status === 'Pending' || booking.status === 'Confirmed';

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative h-40 w-full shrink-0 sm:h-auto sm:w-36">
          <Image
            src={booking.tripSnapshot.coverImage}
            alt={booking.tripSnapshot.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 144px"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900">{booking.tripSnapshot.title}</h3>
              <Badge status={booking.status} />
            </div>

            <div className="mb-3 space-y-1 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {booking.tripSnapshot.destination}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {booking.status === 'Cancelled' && booking.cancelledAt
                  ? formatCancelledDate(booking.cancelledAt)
                  : formatDate(booking.departureDate)
                }
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {booking.travellersCount} traveller{booking.travellersCount !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-xs text-gray-400">Booking Ref: </span>
                <span className="font-mono font-medium text-gray-700">{booking.bookingRef}</span>
              </div>
              <div className="font-bold text-[#FF6B00]">{formatCurrency(booking.totalAmount)}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/bookings/${booking.bookingRef}`}
              className="rounded-lg border border-[#FF6B00] px-3 py-1.5 text-xs font-medium text-[#FF6B00] hover:bg-orange-50"
            >
              View Details
            </Link>
            {canCancel && onCancel && (
              <button
                onClick={() => onCancel(booking._id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
