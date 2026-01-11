'use client'

import type { Order } from '@/types'
import { usePaymentController } from '../../hooks'
import {
  ErrorMessageSection,
  OrderContextSection,
  PaymentHeader,
  QRPaymentSection,
  StickyActionBar,
  SummarySection,
} from '../components/sections'

interface CardPaymentProps {
  total: number
  itemCount: number
  orderId?: string
  existingOrder?: Order | null
  onBack?: () => void
  onPaymentSuccess?: () => void
  onPaymentFailure?: () => void
}

export function CardPaymentPage({
  total,
  itemCount,
  orderId,
  existingOrder,
  onBack,
  onPaymentSuccess,
  onPaymentFailure,
}: CardPaymentProps) {
  const { state, actions } = usePaymentController({
    total,
    itemCount,
    orderId,
    existingOrder,
    onPaymentSuccess,
    onPaymentFailure,
  })

  const handleBack = onBack || actions.goBack

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--gray-50)' }}>
      <PaymentHeader onBack={handleBack} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-4">
          {/* Order Context (when paying for existing order) */}
          {state.existingOrder && <OrderContextSection existingOrder={state.existingOrder} />}

          {/* Summary Card (for new orders) */}
          {!state.existingOrder && <SummarySection total={state.total} itemCount={state.itemCount} />}

          {/* Error Message */}
          {state.error && <ErrorMessageSection error={state.error} />}

          {/* QR Payment Section */}
          <QRPaymentSection paymentStatus={state.paymentStatus} onStartPayment={actions.startPayment} />
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <StickyActionBar
        paymentStatus={state.paymentStatus}
        onViewOrderStatus={actions.handleViewOrderStatus}
        onRetry={handleBack}
      />
    </div>
  )
}
