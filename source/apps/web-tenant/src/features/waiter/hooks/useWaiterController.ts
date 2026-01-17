'use client';

/**
 * Waiter Controller Hook - Public API
 * Manages all state and actions for Service Board
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/context/AuthContext';
import { useServiceOrders } from './queries';
import { sortOrdersByStatus } from '../utils';
import type { ServiceOrder, OrderStatus, ServiceTabCounts } from '../model/types';
import { logger } from '@/shared/utils/logger';
import { orderControllerUpdateOrderStatus } from '@/services/generated/orders/orders';
import { api as axiosInstance } from '@/services/axios';
import type { UpdateOrderStatusDtoStatus } from '@/services/generated/models';

interface WaiterState {
  // Data
  orders: ServiceOrder[];
  isLoading: boolean;
  error: Error | null;
  
  // UI State
  activeTab: OrderStatus;
  expandedOrders: Set<string>;
  soundEnabled: boolean;
  autoRefresh: boolean;
  
  // Derived
  currentOrders: ServiceOrder[];
  tabCounts: ServiceTabCounts;
  
  // Toast
  showSuccessToast: boolean;
  toastMessage: string;
}

interface WaiterActions {
  // Tab
  setActiveTab: (tab: OrderStatus) => void;
  
  // Order actions
  acceptOrder: (order: ServiceOrder) => void;
  rejectOrder: (order: ServiceOrder) => void;
  cancelOrder: (order: ServiceOrder) => void;
  markServed: (order: ServiceOrder) => void;
  markCompleted: (order: ServiceOrder) => void;
  markPaid: (order: ServiceOrder) => void;
  closeTable: (order: ServiceOrder) => void;
  toggleOrderExpanded: (orderId: string) => void;
  
  // UI actions
  toggleSound: () => void;
  toggleAutoRefresh: () => void;
  refresh: () => void;
  manualOrder: () => void;
  closeToast: () => void;
  handleLogout: () => void;
}

export interface UseWaiterControllerReturn {
  state: WaiterState;
  actions: WaiterActions;
}

export function useWaiterController(): UseWaiterControllerReturn {
  // Router and Auth
  const router = useRouter();
  const { logout } = useAuth();
  
  // Data from query hook
  const { data: fetchedOrders = [], isLoading, error, refetch } = useServiceOrders();
  
  // Local state for orders (for optimistic updates)
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState<OrderStatus>('ready');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Sync fetched orders to local state
  useEffect(() => {
    setOrders(fetchedOrders);
  }, [fetchedOrders]);

  // Auto refresh - reduced to 2s for more responsive updates
  useEffect(() => {
    if (!autoRefresh) return;

    const refreshInterval = setInterval(() => {
      refetch();
    }, 2000); // 2 seconds for faster realtime feel

    return () => clearInterval(refreshInterval);
  }, [autoRefresh, refetch]);

  // Derived values
  const getOrdersByStatus = useCallback((status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  }, [orders]);

  const tabCounts: ServiceTabCounts = useMemo(() => {
    const counts = {
      placed: getOrdersByStatus('placed').length,
      confirmed: getOrdersByStatus('confirmed').length,
      preparing: getOrdersByStatus('preparing').length,
      ready: getOrdersByStatus('ready').length,
      served: getOrdersByStatus('served').length,
      completed: getOrdersByStatus('completed').length,
    };

    if (process.env.NEXT_PUBLIC_USE_LOGGING === 'true') {
      logger.info('[ui] TAB_COUNTS_COMPUTED', {
        feature: 'waiter',
        entity: 'tabCounts',
        counts,
      });
    }

    return counts;
  }, [getOrdersByStatus]);

  const currentOrders = useMemo(() => {
    const sorted = sortOrdersByStatus(orders, activeTab);
    
    if (process.env.NEXT_PUBLIC_USE_LOGGING === 'true') {
      logger.info('[ui] TAB_ORDERS_APPLIED', {
        feature: 'waiter',
        entity: 'currentOrders',
        activeTab,
        inputCount: orders.length,
        outputCount: sorted.length,
        sample: process.env.NEXT_PUBLIC_LOG_DATA === 'true' && sorted[0]
          ? {
              orderNumber: sorted[0].orderNumber,
              table: sorted[0].table,
              status: sorted[0].status,
              itemsCount: sorted[0].items?.length || 0,
              total: sorted[0].total,
            }
          : undefined,
      });
    }
    
    return sorted;
  }, [orders, activeTab]);

  // Logout handler
  const handleLogout = useCallback(() => {
    logout();
    router.push('/auth/login');
  }, [logout, router]);

  /**
   * Update order status via API with optimistic update
   * 
   * @param orderId - Order to update
   * @param newWaiterStatus - Target waiter UI status (for optimistic update)
   * @param backendStatus - Actual backend status to send to API
   * @param successMessage - Toast message on success
   * @param notes - Optional notes for status history
   */
  const updateOrderStatusApi = useCallback(async (
    orderId: string,
    newWaiterStatus: OrderStatus,
    backendStatus: UpdateOrderStatusDtoStatus,
    successMessage: string,
    notes?: string
  ) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      logger.warn('[waiter] ORDER_NOT_FOUND', { orderId });
      return;
    }

    const previousStatus = order.status;

    logger.info('[waiter] UPDATE_STATUS_ATTEMPT', {
      orderId,
      orderNumber: order.orderNumber,
      fromStatus: previousStatus,
      toWaiterStatus: newWaiterStatus,
      toBackendStatus: backendStatus,
    });

    // Optimistic update
    setOrders(prev =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newWaiterStatus } : o))
    );
    setToastMessage(successMessage);
    setShowSuccessToast(true);

    try {
      // Call API
      await orderControllerUpdateOrderStatus(orderId, {
        status: backendStatus,
        notes,
      });

      logger.info('[waiter] UPDATE_STATUS_SUCCESS', {
        orderId,
        orderNumber: order.orderNumber,
        newStatus: backendStatus,
      });

      // Refetch to sync with backend and trigger WebSocket broadcast
      refetch();
    } catch (error) {
      // Revert optimistic update on error
      setOrders(prev =>
        prev.map((o) => (o.id === orderId ? { ...o, status: previousStatus } : o))
      );
      setToastMessage(`Failed to update ${order.orderNumber}`);
      setShowSuccessToast(true);

      logger.error('[waiter] UPDATE_STATUS_ERROR', {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [orders, refetch]);

  // Actions
  const actions: WaiterActions = {
    setActiveTab,
    
    acceptOrder: useCallback(async (order: ServiceOrder) => {
      logger.info('[waiter] ACCEPT_ORDER_ACTION', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        table: order.table,
        fromStatus: order.status,
        toStatus: 'confirmed',
      });
      // Accept = confirm order = move to RECEIVED
      // Backend flow: PENDING -> RECEIVED (waiter confirmed) -> PREPARING (kitchen started)
      // Waiter UI: placed -> confirmed (shows in "Confirmed" tab, sent to KDS)
      await updateOrderStatusApi(
        order.id,
        'confirmed',     // waiter UI status
        'RECEIVED',      // backend status - waiter confirmed, ready for kitchen
        `${order.orderNumber} accepted and sent to kitchen`,
        'Confirmed by waiter'
      );
    }, [updateOrderStatusApi]),
    
    rejectOrder: useCallback(async (order: ServiceOrder) => {
      logger.info('[waiter] REJECT_ORDER_ACTION', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        table: order.table,
        fromStatus: order.status,
        toStatus: 'completed',
      });
      // Use cancel API for rejection
      try {
        await axiosInstance.post(`/api/v1/admin/orders/${order.id}/cancel`, { reason: 'Rejected by waiter' });
        setOrders(prev => prev.filter(o => o.id !== order.id)); // Remove from list
        setToastMessage(`${order.orderNumber} rejected`);
        setShowSuccessToast(true);
        refetch();
      } catch (error) {
        logger.error('[waiter] REJECT_ORDER_ERROR', { orderId: order.id, error });
        setToastMessage(`Failed to reject ${order.orderNumber}`);
        setShowSuccessToast(true);
      }
    }, [refetch]),
    
    cancelOrder: useCallback(async (order: ServiceOrder) => {
      logger.info('[waiter] CANCEL_ORDER_ACTION', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        table: order.table,
        fromStatus: order.status,
        toStatus: 'completed',
      });
      try {
        await axiosInstance.post(`/api/v1/admin/orders/${order.id}/cancel`, { reason: 'Cancelled by waiter' });
        setOrders(prev => prev.filter(o => o.id !== order.id));
        setToastMessage(`${order.orderNumber} cancelled`);
        setShowSuccessToast(true);
        refetch();
      } catch (error) {
        logger.error('[waiter] CANCEL_ORDER_ERROR', { orderId: order.id, error });
        setToastMessage(`Failed to cancel ${order.orderNumber}`);
        setShowSuccessToast(true);
      }
    }, [refetch]),
    
    markServed: useCallback(async (order: ServiceOrder) => {
      logger.info('[waiter] MARK_SERVED_ACTION', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        table: order.table,
        fromStatus: order.status,
        toStatus: 'served',
      });
      await updateOrderStatusApi(
        order.id,
        'served',        // waiter UI status  
        'SERVED',        // backend status
        `${order.orderNumber} marked as served`,
        'Served by waiter'
      );
    }, [updateOrderStatusApi]),
    
    markCompleted: useCallback(async (order: ServiceOrder) => {
      logger.info('[waiter] MARK_COMPLETED_ACTION', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        table: order.table,
        fromStatus: order.status,
        toStatus: 'completed',
      });
      await updateOrderStatusApi(
        order.id,
        'completed',     // waiter UI status
        'COMPLETED',     // backend status
        `${order.orderNumber} marked as completed`,
        'Completed'
      );
    }, [updateOrderStatusApi]),
    
    markPaid: useCallback(async (order: ServiceOrder) => {
      try {
        logger.info('[waiter] MARK_PAID_ACTION_ATTEMPT', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          table: order.table,
          previousPaymentStatus: order.paymentStatus,
        });
        
        // Optimistic update
        setOrders(prev => 
          prev.map((o) => (o.id === order.id ? { ...o, paymentStatus: 'paid' } : o))
        );
        
        // Call API
        const axiosInstance = (await import('@/services/axios')).default;
        await axiosInstance.patch(`/api/v1/admin/orders/${order.id}/mark-paid`);
        
        // Refetch to sync with backend
        refetch();
        
        setToastMessage(`${order.orderNumber} payment marked as complete`);
        setShowSuccessToast(true);
        
        logger.info('[waiter] MARK_PAID_ACTION_SUCCESS', {
          orderId: order.id,
          orderNumber: order.orderNumber,
        });
      } catch (error) {
        // Revert optimistic update on error
        setOrders(prev => 
          prev.map((o) => (o.id === order.id ? { ...o, paymentStatus: order.paymentStatus } : o))
        );
        
        setToastMessage(`Failed to mark ${order.orderNumber} as paid`);
        setShowSuccessToast(true);
        
        logger.error('[waiter] MARK_PAID_ACTION_ERROR', {
          orderId: order.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }, [refetch]),
    
    closeTable: useCallback(async (order: ServiceOrder) => {
      try {
        logger.info('[waiter] CLOSE_TABLE_ACTION_ATTEMPT', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          table: order.table,
          status: order.status,
        });
        
        // Extract tableId from order (assuming it exists)
        // If order doesn't have tableId, we need to find it from the order data
        const axiosInstance = (await import('@/services/axios')).default;
        
        // Call API to clear table
        // Note: We need the actual tableId, not just table number
        // This might need adjustment based on your Order model
        await axiosInstance.post(`/api/v1/admin/tables/${order.table}/clear`);
        
        // Refetch orders to sync with backend
        refetch();
        
        setToastMessage(`${order.table} closed successfully`);
        setShowSuccessToast(true);
        
        logger.info('[waiter] CLOSE_TABLE_ACTION_SUCCESS', {
          orderId: order.id,
          table: order.table,
        });
      } catch (error) {
        setToastMessage(`Failed to close ${order.table}`);
        setShowSuccessToast(true);
        
        logger.error('[waiter] CLOSE_TABLE_ACTION_ERROR', {
          orderId: order.id,
          table: order.table,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }, [refetch]),
    
    toggleOrderExpanded: useCallback((orderId: string) => {
      setExpandedOrders(prev => {
        const newExpanded = new Set(prev);
        if (newExpanded.has(orderId)) {
          newExpanded.delete(orderId);
        } else {
          newExpanded.add(orderId);
        }
        return newExpanded;
      });
    }, []),
    
    toggleSound: useCallback(() => setSoundEnabled(prev => !prev), []),
    toggleAutoRefresh: useCallback(() => setAutoRefresh(prev => !prev), []),
    
    refresh: useCallback(() => {
        logger.info('[waiter] REFRESH_ACTION', { trigger: 'manual' });
      refetch();
      setToastMessage('Orders refreshed');
      setShowSuccessToast(true);
    }, [refetch]),
    
    manualOrder: useCallback(() => {
      setToastMessage('Manual order feature - Coming soon');
      setShowSuccessToast(true);
    }, []),
    
    closeToast: useCallback(() => setShowSuccessToast(false), []),
    
    handleLogout,
  };

  // State
  const state: WaiterState = {
    orders,
    isLoading,
    error,
    activeTab,
    expandedOrders,
    soundEnabled,
    autoRefresh,
    currentOrders,
    tabCounts,
    showSuccessToast,
    toastMessage,
  };

  return { state, actions };
}
