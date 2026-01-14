'use client'

import { useMemo } from 'react'
import { useCart as useCartApi, useCartMutations } from '@/hooks/useCartApi'
import { TAX_RATE, SERVICE_CHARGE_RATE } from '@/lib/constants'
import { mapCartItemDtoToCartItem } from '@/lib/mappers/cart-mapper'

/**
 * Main cart hook - uses server-driven cart via React Query
 * Provides computed totals and simplified API
 */
export function useCart() {
  const { data: cartResponse, isLoading, error } = useCartApi()
  const { addToCart, updateItem, removeItem, clearCart } = useCartMutations()

  const cart = cartResponse?.data
  const rawItems = cart?.items ?? []
  
  // Map backend DTOs to frontend CartItem type
  const items = useMemo(() => rawItems.map(mapCartItemDtoToCartItem), [rawItems])

  // Calculate totals (server also provides these, we use server values)
  const totals = useMemo(() => {
    if (cart) {
      return {
        subtotal: cart.subtotal,
        tax: cart.tax,
        serviceCharge: cart.serviceCharge,
        total: cart.total,
      }
    }
    
    // Fallback calculation if server data not available
    const subtotal = items.reduce((sum, item) => {
      const itemPrice = item.menuItem.basePrice * item.quantity;
      return sum + itemPrice;
    }, 0)
    const tax = subtotal * TAX_RATE
    const serviceCharge = subtotal * SERVICE_CHARGE_RATE
    const total = subtotal + tax + serviceCharge

    return { subtotal, tax, serviceCharge, total }
  }, [cart, items])

  const itemCount = cart?.itemCount ?? items.length

  return {
    items,
    itemCount,
    isLoading,
    error,
    addToCart: addToCart.mutate,
    updateQuantity: (itemId: string, quantity: number) => updateItem.mutate({ itemId, quantity }),
    removeItem: (itemId: string) => removeItem.mutate(itemId),
    clearCart: clearCart.mutate,
    ...totals,
  }
}
