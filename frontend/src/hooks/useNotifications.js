import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { orderService } from '../services/orderService'
import { storeService } from '../services/storeService'

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

  const markAllAsRead = useCallback(() => {
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
  }, [notifications, readIds, storageKey])

  const markAsRead = useCallback(
    (id) => {
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
    },
    [readIds, storageKey]
  )

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length

  return {
    notifications,
    unreadCount,
    readIds,
    markAllAsRead,
    markAsRead,
  }
}
