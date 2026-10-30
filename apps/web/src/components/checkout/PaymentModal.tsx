'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useCreateOrder, useProcessPayment } from '@/hooks/usePayment';
import { formatCurrency } from '@/lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingRef: string;
  tripTitle: string;
  amount: number;
}

type Scenario = 'success' | 'failure' | 'pending';
type Step = 'select' | 'processing' | 'success' | 'failed' | 'pending';

export default function PaymentModal({
  isOpen,
  onClose,
  bookingRef,
  tripTitle,
  amount,
}: PaymentModalProps) {
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario>('success');
  const [step, setStep] = useState<Step>('select');
  const [finalBookingRef, setFinalBookingRef] = useState(bookingRef);

  const createOrder = useCreateOrder();
  const processPayment = useProcessPayment();

  const isDev = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_API_URL?.includes('localhost');

  const handlePay = async () => {
    try {
      setStep('processing');

      // Step 1: Create payment order
      const order = await createOrder.mutateAsync({
        bookingRef,
        amount,
        currency: 'INR',
      });

      // Step 2: Process with selected scenario
      const result = await processPayment.mutateAsync({
        paymentRef: order.paymentRef,
        scenario,
      });

      if (result?.bookingRef) setFinalBookingRef(result.bookingRef);

      if (scenario === 'success') setStep('success');
      else if (scenario === 'failure') setStep('failed');
      else setStep('pending');
    } catch {
      setStep('failed');
    }
  };

  const handleClose = () => {
    setStep('select');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Complete Payment" size="md">
      {/* Dev Notice */}
      {isDev && step === 'select' && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <strong>Development Mode</strong> — This is a mock payment. No real money will be charged.
          </div>
        </div>
      )}

      {/* Step: Select */}
      {step === 'select' && (
        <div className="space-y-5">
          {/* Order Summary */}
          <div className="rounded-xl bg-gray-50 p-4">
            <h4 className="mb-2 text-sm font-semibold text-gray-700">Order Summary</h4>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{tripTitle}</span>
              <span className="font-bold text-gray-900">{formatCurrency(amount)}</span>
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>Booking Ref</span>
              <span className="font-mono">{bookingRef}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-700">Payment Method</h4>
            <div className="rounded-xl border-2 border-[#FF6B00] bg-orange-50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF6B00] text-white text-xs font-bold">
                  M
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Mock Payment</div>
                  <div className="text-xs text-gray-500">Development Only</div>
                </div>
              </div>
            </div>
            <div className="mt-2 rounded-xl border border-dashed border-gray-200 p-3 opacity-50">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500 text-xs">
                  💳
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Add Card</div>
                  <div className="text-xs text-gray-400">Coming Soon</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scenario selector (dev only) */}
          {isDev && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Test Scenario
              </label>
              <div className="flex flex-wrap gap-2">
                {(['success', 'failure', 'pending'] as Scenario[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScenario(s)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${
                      scenario === s
                        ? s === 'success'
                          ? 'border-green-500 bg-green-500 text-white'
                          : s === 'failure'
                          ? 'border-red-500 bg-red-500 text-white'
                          : 'border-yellow-500 bg-yellow-500 text-white'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handlePay}
          >
            Pay {formatCurrency(amount)}
          </Button>
        </div>
      )}

      {/* Step: Processing */}
      {step === 'processing' && (
        <div className="flex flex-col items-center py-8 text-center">
          <svg className="h-12 w-12 animate-spin text-[#FF6B00]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-4 text-sm text-gray-600">Processing your payment…</p>
        </div>
      )}

      {/* Step: Success */}
      {step === 'success' && (
        <div className="flex flex-col items-center py-6 text-center">
          <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
          <h3 className="mb-1 text-xl font-bold text-gray-900">Booking Confirmed!</h3>
          <p className="mb-1 text-sm text-gray-600">Your trip has been successfully booked.</p>
          <div className="mb-6 rounded-lg bg-green-50 px-4 py-2">
            <p className="text-xs text-gray-500">Booking Reference</p>
            <p className="font-mono text-lg font-bold text-green-700">{finalBookingRef}</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button variant="secondary" className="flex-1" onClick={() => router.push('/bookings')}>
              My Bookings
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => router.push(`/bookings/${finalBookingRef}`)}>
              View Details
            </Button>
          </div>
        </div>
      )}

      {/* Step: Failed */}
      {step === 'failed' && (
        <div className="flex flex-col items-center py-6 text-center">
          <XCircle className="mb-4 h-16 w-16 text-red-500" />
          <h3 className="mb-2 text-xl font-bold text-gray-900">Payment Failed</h3>
          <p className="mb-6 text-sm text-gray-600">
            Your payment could not be processed. No amount was charged.
          </p>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button variant="ghost" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => setStep('select')}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Step: Pending */}
      {step === 'pending' && (
        <div className="flex flex-col items-center py-6 text-center">
          <AlertTriangle className="mb-4 h-16 w-16 text-yellow-500" />
          <h3 className="mb-2 text-xl font-bold text-gray-900">Payment Pending</h3>
          <p className="mb-6 text-sm text-gray-600">
            Your payment is being processed. Check My Bookings for updates.
          </p>
          <Button variant="primary" className="w-full" onClick={() => router.push('/bookings')}>
            Go to My Bookings
          </Button>
        </div>
      )}
    </Modal>
  );
}
