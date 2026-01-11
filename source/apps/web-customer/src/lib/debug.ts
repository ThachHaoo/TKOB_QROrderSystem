/**
 * Unified debug logging utility for web-customer
 * Gate all logs behind NEXT_PUBLIC_DEBUG_CUSTOMER env flag
 */

/**
 * Log a debug message with feature and action context
 * @param feature Feature name (e.g., 'Cart', 'Checkout', 'Payment')
 * @param action Action name (e.g., 'add', 'place_order', 'success')
 * @param data Optional data to log
 */
export function debugLog(feature: string, action: string, data?: any) {
  // Only log if debug flag is enabled
  if (process.env.NEXT_PUBLIC_DEBUG_CUSTOMER !== 'true') {
    return
  }

  const timestamp = new Date().toISOString().slice(11, 19) // HH:MM:SS
  const prefix = `[${timestamp}] [${feature}]`

  if (data !== undefined) {
    console.log(`${prefix} ${action}`, data)
  } else {
    console.log(`${prefix} ${action}`)
  }
}

/**
 * Log a warning message
 */
export function debugWarn(feature: string, action: string, data?: any) {
  if (process.env.NEXT_PUBLIC_DEBUG_CUSTOMER !== 'true') {
    return
  }

  const timestamp = new Date().toISOString().slice(11, 19)
  const prefix = `[${timestamp}] [${feature}]`

  if (data !== undefined) {
    console.warn(`${prefix} ${action}`, data)
  } else {
    console.warn(`${prefix} ${action}`)
  }
}

/**
 * Log an error message
 */
export function debugError(feature: string, action: string, error?: any) {
  if (process.env.NEXT_PUBLIC_DEBUG_CUSTOMER !== 'true') {
    return
  }

  const timestamp = new Date().toISOString().slice(11, 19)
  const prefix = `[${timestamp}] [${feature}]`

  if (error !== undefined) {
    console.error(`${prefix} ${action}`, error)
  } else {
    console.error(`${prefix} ${action}`)
  }
}
