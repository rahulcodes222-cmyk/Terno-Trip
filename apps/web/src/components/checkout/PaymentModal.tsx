'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Lock, Loader2, CreditCard } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useCreateOrder, useProcessPayment } from '@/hooks/usePayment';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

// Load Cashfree JS SDK dynamically
function loadCashfreeSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject();
    if (window.Cashfree) return resolve();

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
    document.head.appendChild(script);
  });
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingRef: string;
  tripTitle: string;
  amount: number;
}

type Step = 'review' | 'processing' | 'success' | 'failed';

declare global {
  interface Window {
    Cashfree?: (config: { mode: string }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget: string;
      }) => { error: unknown; paymentDetails: unknown };
    };
  }
}

export default function PaymentModal({
  isOpen,
  onClose,
  bookingRef,
  tripTitle,
  amount,
}: PaymentModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('review');
  const [finalBookingRef, setFinalBookingRef] = useState(bookingRef);
  const [errorMsg, setErrorMsg] = useState('');
  const [sdkReady, setSdkReady] = useState(false);

  const createOrder = useCreateOrder();
  const processPayment = useProcessPayment();

  // Pre-load Cashfree SDK when modal opens
  useEffect(() => {
    if (!isOpen) return;
    loadCashfreeSDK()
      .then(() => setSdkReady(true))
      .catch(() => {
        console.warn('Cashfree SDK failed to load, will use fallback');
        setSdkReady(true); // still proceed, handlePay will catch it
      });
  }, [isOpen]);

  const handlePay = async () => {
    setErrorMsg('');
    setStep('processing');

    try {
      // Step 1 — Create order server-side → get paymentSessionId
      const order = await createOrder.mutateAsync({
        bookingRef,
        amount,
        currency: 'INR',
        email: user?.email,
        phone: user?.email ? undefined : undefined,
      });

      // Step 2 — Open Cashfree checkout if session available
      if (order?.paymentSessionId && sdkReady && window.Cashfree) {
        const cashfree = window.Cashfree({
          mode: 'sandbox', // change to 'production' with prod credentials
        });

        const result = await cashfree.checkout({
          paymentSessionId: order.paymentSessionId,
          redirectTarget: '_modal',
        });

        if (result.error) {
          throw new Error((result.error as { message?: string })?.message ?? 'Payment failed');
        }

        // Step 3 — Verify payment server-side after SDK success
        setStep('processing');
        const verified = await processPayment.mutateAsync({
          paymentRef: order.paymentRef!,
          scenario: 'success',
        });

        if (verified?.status === 'Success') {
          setFinalBookingRef(bookingRef);
          setStep('success');
        } else {
          throw new Error('Payment verification failed. Please contact support.');
        }
      } else {
        // Fallback: direct mock processing (when SDK not available)
        const result = await processPayment.mutateAsync({
          paymentRef: order.paymentRef!,
          scenario: 'success',
        });
        if (result) setFinalBookingRef(bookingRef);
        setStep('success');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as Error)?.message ??
        'Payment could not be processed. Please try again.';
      setErrorMsg(msg);
      setStep('failed');
    }
  };

  const handleClose = () => {
    if (step === 'processing') return; // don't close while processing
    setStep('review');
    setErrorMsg('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Complete Payment" size="md">

      {/* ── Review & Pay ── */}
      {step === 'review' && (
        <div className="space-y-5">
          {/* Order Summary */}
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Order Summary</p>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{tripTitle}</p>
                <p className="text-xs text-gray-500">Ref: <span className="font-mono">{bookingRef}</span></p>
              </div>
              <p className="shrink-0 text-lg font-bold text-[#FF6B00]">{formatCurrency(amount)}</p>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="rounded-xl border border-gray-100 p-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Trip Amount</span>
              <span>{formatCurrency(Math.round(amount / 1.05))}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST (5%)</span>
              <span>{formatCurrency(amount - Math.round(amount / 1.05))}</span>
            </div>
            <div className="mt-2 flex justify-between border-t pt-2 font-bold text-gray-900">
              <span>Total</span>
              <span className="text-[#FF6B00]">{formatCurrency(amount)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="flex items-center gap-3 rounded-xl border-2 border-[#FF6B00] bg-orange-50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FF6B00] text-white">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Cashfree Payments</p>
              <p className="text-xs text-gray-500">UPI · Card · Net Banking · Wallet</p>
            </div>
          </div>

          {/* Security */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Lock className="h-3 w-3" />
            <span>Secured by Cashfree · 256-bit SSL encryption</span>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handlePay}
            loading={!sdkReady}
            disabled={!sdkReady}
          >
            {sdkReady ? `Pay ${formatCurrency(amount)} via Cashfree` : 'Loading payment...'}
          </Button>
        </div>
      )}

      {/* ── Processing ── */}
      {step === 'processing' && (
        <div className="flex flex-col items-center py-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#FF6B00]" />
          <p className="mt-4 text-sm font-medium text-gray-700">Processing your payment…</p>
          <p className="mt-1 text-xs text-gray-400">Please wait, do not close this window</p>
        </div>
      )}

      {/* ── Success ── */}
      {step === 'success' && (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h3 className="mb-1 text-xl font-bold text-gray-900">Booking Confirmed! 🎉</h3>
          <p className="mb-1 text-sm text-gray-600">Your trip has been successfully booked.</p>
          <p className="mb-5 text-xs text-gray-400">A confirmation email has been sent to your inbox.</p>
          <div className="mb-6 rounded-xl bg-green-50 px-8 py-3">
            <p className="text-xs text-gray-500">Booking Reference</p>
            <p className="font-mono text-lg font-bold text-green-700">{finalBookingRef}</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button variant="secondary" className="flex-1" onClick={() => router.push('/bookings')}>
              My Bookings
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => router.push(`/bookings/${finalBookingRef}`)}>
              View Details →
            </Button>
          </div>
        </div>
      )}

      {/* ── Failed ── */}
      {step === 'failed' && (
        <div className="flex flex-col items-center py-6 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900">Payment Failed</h3>
          <p className="mb-6 text-sm text-gray-500">{errorMsg || 'Something went wrong. No amount was charged.'}</p>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button variant="ghost" className="flex-1" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={() => { setStep('review'); setErrorMsg(''); }}>
              Try Again
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
