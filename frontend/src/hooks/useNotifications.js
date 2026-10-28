import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { orderService } from '../services/orderService'
import { storeService } from '../services/storeService'
import { notificationService } from '../services/notificationService'

/**
 * Custom hook desacoplado para la gestión de notificaciones y alertas (Milestone 7 - Issue #40).
 *
 * Encapsula la obtención de pedidos activos, comandas de cocina y estado de lectura.
 *
 * @param {Array|null} [customNotifications=null] - Notificaciones personalizadas para tests o mock
 * @returns {{
 *   notifications: Array,
 *   unreadCount: number,
 *   readIds: Array<string>,
 *   markAllAsRead: () => void,
 *   markAsRead: (id: string) => void
 * }}
 */
export function useNotifications(customNotifications = null) {
  const { user, getValidToken } = useAuth()
  const [internalNotifications, setInternalNotifications] = useState([])
  const notifications = customNotifications || internalNotifications

  const [readIds, setReadIds] = useState(() => {
    if (!user?.id) return []
    try {
      const stored = localStorage.getItem(`foodrush_read_notifications_${user.id}`)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const storageKey = user?.id ? `foodrush_read_notifications_${user.id}` : null

  useEffect(() => {
    if (customNotifications) return
    let isMounted = true

    const loadNotifications = async () => {
      if (!user || !getValidToken) return

      try {
        const token = await getValidToken()
        if (!token || !isMounted) return

        const notifs = []

        // 1. Notificaciones como cliente (órdenes activas o entregadas recientes)
        const ordersRes = await orderService.getOrders(token)
        if (!isMounted) return

        if (ordersRes.success && Array.isArray(ordersRes.data)) {
          for (const order of ordersRes.data) {
            if (order.status === 'preparing') {
              notifs.push({
                id: `client-preparing-${order.id}`,
                type: 'order_preparing',
                title: `Pedido #${order.id} en preparación`,
                message: `Tu pedido en ${order.store_name || 'el local'} se está cocinando.`,
                icon: 'bi-fire',
                iconBgClass: 'bg-warning-subtle text-warning',
                link: '/pedidos',
                orderId: order.id,
              })
            } else if (order.status === 'delivering') {
              notifs.push({
                id: `client-delivering-${order.id}`,
                type: 'order_delivering',
                title: `¡Pedido #${order.id} en camino!`,
                message: `El repartidor va hacia tu domicilio con tu orden.`,
                icon: 'bi-bicycle',
                iconBgClass: 'bg-primary-subtle text-primary',
                link: '/pedidos',
                orderId: order.id,
              })
            } else if (order.status === 'delivered' && !order.rating) {
              notifs.push({
                id: `client-delivered-${order.id}`,
                type: 'order_delivered',
                title: `Pedido #${order.id} entregado`,
                message: `¿Qué tal estuvo tu pedido en ${order.store_name || 'el local'}? ¡Calificá tu experiencia!`,
                icon: 'bi-star-fill',
                iconBgClass: 'bg-warning-subtle text-warning',
                link: '/pedidos',
                orderId: order.id,
              })
            } else if (order.status === 'cancelled') {
              notifs.push({
                id: `client-cancelled-${order.id}`,
                type: 'order_cancelled',
                title: `Pedido #${order.id} cancelado`,
                message: order.cancellation_reason || 'El pedido ha sido cancelado.',
                icon: 'bi-x-circle-fill',
                iconBgClass: 'bg-danger-subtle text-danger',
                link: '/pedidos',
                orderId: order.id,
              })
            }
          }
        }

        // 2. Notificaciones para vendedores (órdenes pendientes en cocina)
        if (user.role === 'vendedor' || user.role === 'admin') {
          const storeRes = await storeService.getMyStore(token)
          if (!isMounted) return

          if (storeRes.success && storeRes.data?.id) {
            const storeId = storeRes.data.id
            const kitchenOrdersRes = await orderService.getStoreOrders(storeId, token)
            if (!isMounted) return

            if (kitchenOrdersRes.success && Array.isArray(kitchenOrdersRes.data)) {
              const pendingOrders = kitchenOrdersRes.data.filter((o) => o.status === 'pending')
              for (const pOrder of pendingOrders) {
                notifs.push({
                  id: `vendor-pending-${pOrder.id}`,
                  type: 'kitchen_order',
                  title: `Nuevo pedido entrante #${pOrder.id}`,
                  message: `Tenés una nueva comanda esperando confirmación en cocina.`,
                  icon: 'bi-bell-fill',
                  iconBgClass: 'bg-danger-subtle text-danger',
                  link: '/panel-tienda',
                  orderId: pOrder.id,
                })
              }
            }
          }
        }

        // 3. Notificaciones persistentes del backend (moderación, cancelaciones automáticas, carrito)
        const backendRes = await notificationService.getNotifications(token)
        if (!isMounted) return

        if (backendRes.success && Array.isArray(backendRes.data)) {
          for (const bNotif of backendRes.data) {
            let icon = 'bi-bell-fill'
            let iconBgClass = 'bg-info-subtle text-info'

            if (bNotif.notification_type === 'store_moderation' || bNotif.notification_type === 'order_cancelled') {
              icon = 'bi-shield-exclamation'
              iconBgClass = 'bg-danger-subtle text-danger'
            } else if (bNotif.notification_type === 'product_moderation' || bNotif.notification_type === 'cart_update') {
              icon = 'bi-exclamation-triangle-fill'
              iconBgClass = 'bg-warning-subtle text-warning'
            }

            notifs.push({
              id: `backend-${bNotif.id}`,
              backendId: bNotif.id,
              type: bNotif.notification_type,
              title: bNotif.title,
              message: bNotif.message,
              icon,
              iconBgClass,
              link: bNotif.link || '/pedidos',
              isRead: bNotif.is_read,
              createdAt: bNotif.created_at,
            })
          }
        }

        if (isMounted) {
          setInternalNotifications(notifs)
        }
      } catch {
        // Ignorar fallas silenciosas en la barra de notificaciones
      }
    }

    loadNotifications()

    return () => {
      isMounted = false
    }
  }, [user, getValidToken, customNotifications])

  const markAllAsRead = useCallback(async () => {
    const allIds = notifications.map((n) => n.id)
    const updated = Array.from(new Set([...readIds, ...allIds]))
    setReadIds(updated)
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated))
      } catch {
        // Ignorar errores de quota de almacenamiento
      }
    }
    if (getValidToken) {
      const token = await getValidToken()
      if (token) {
        notificationService.markAllAsRead(token).catch(() => {})
      }
    }
  }, [notifications, readIds, storageKey, getValidToken])

  const markAsRead = useCallback(
    async (id) => {
      if (!readIds.includes(id)) {
        const updated = [...readIds, id]
        setReadIds(updated)
        if (storageKey) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(updated))
          } catch {
            // Ignorar
          }
        }
      }
      if (typeof id === 'string' && id.startsWith('backend-') && getValidToken) {
        const backendId = id.replace('backend-', '')
        const token = await getValidToken()
        if (token) {
          notificationService.markAsRead(backendId, token).catch(() => {})
        }
      }
    },
    [readIds, storageKey, getValidToken]
  )

  const unreadCount = notifications.filter((n) => !n.isRead && !readIds.includes(n.id)).length

  return {
    notifications,
    unreadCount,
    readIds,
    markAllAsRead,
    markAsRead,
  }
}
