import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { mockTable } from '@/lib/mockData'
import { debugLog, debugError } from '@/lib/debug'
import { SERVICE_CHARGE_RATE, type CheckoutFormData, type CheckoutState } from '../model'
import { OrdersDataFactory } from '@/features/orders/data'
import { useSession } from '@/features/tables/hooks'

export function useCheckoutController() {
  const router = useRouter()
  const { items: cartItems, subtotal, tax, serviceCharge, total, clearCart } = useCart()
  const { session } = useSession()
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    notes: '',
    paymentMethod: 'counter',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const state: CheckoutState = useMemo(
    () => ({
      ...formData,
    }),
    [formData]
  )

  const updateField = (field: keyof CheckoutFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const tableId = session?.tableId ?? (mockTable as any)?.id ?? 'table-001'

      debugLog('Checkout', 'place_order', {
        itemCount: cartItems.length,
        total,
        paymentMethod: formData.paymentMethod,
      })

      if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
        console.log('[Checkout] Creating order with payment method:', formData.paymentMethod)
      }

      const strategy = OrdersDataFactory.getStrategy()
      const response = await strategy.createOrder({
        tableId,
        items: cartItems,
        customerName: formData.name,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
      })

      if (!response.success || !response.data) {
        setError(response.message || 'Failed to create order')
        setIsSubmitting(false)
        return
      }

      const orderId = response.data.id

      if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
        console.log('[Checkout] Order created successfully:', orderId)
      }

      // Clear cart immediately after successful order creation
      // This applies to both card and counter payments
      clearCart()
      
      if (process.env.NEXT_PUBLIC_MOCK_DEBUG) {
        console.log('[Checkout] Cart cleared after order creation')
      }

      if (formData.paymentMethod === 'card') {
        router.push(`/payment?orderId=${orderId}`)
      } else {
        router.push(`/payment/success?orderId=${orderId}`)
      }
    } catch (err) {
      debugError('Checkout', 'place_order_error', err)
      console.error('[Checkout] Order creation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create order')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  return {
    // Form state
    state: { ...state, isSubmitting, error },
    updateField,

    // Cart info
    cartItems,
    mockTable,
    subtotal,
    tax,
    serviceCharge,
    total,

    // Actions
    handleSubmit,
    handleBack,
  }
}
