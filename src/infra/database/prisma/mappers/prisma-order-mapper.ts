import { Order } from '@/domain/order/order'
import {
  Prisma,
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
  OrderStatus as PrismaOrderStatus,
} from '@prisma/client'

type RawOrderWithItems = PrismaOrder & {
  orderItems: PrismaOrderItem[]
}

export class PrismaOrderMapper {
  private static prismaToDomainStatus(status: PrismaOrderStatus): string {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'PAYMENT_PENDING'
      case 'PAID':
        return 'PAID'
      case 'PREPARING':
        return 'PREPARING'
      case 'AWAITING_RESULT':
        return 'READY'
      case 'DELIVERING':
        return 'READY'
      case 'COMPLETED':
        return 'COMPLETED'
      case 'CANCELED':
        return 'CANCELED'
      case 'REFUNDED':
        return 'CANCELED'
      default:
        return 'PAYMENT_PENDING'
    }
  }
  static toDomain(raw: RawOrderWithItems): Order {
    return Order.restore(
      {
        storeId: raw.storeId,
        customerId: raw.customerId ?? undefined,
        code: raw.code,
        status: PrismaOrderMapper.prismaToDomainStatus(raw.status),
        total: raw.payAmount ?? raw.totalAmount, // fallback if domain expects a single total
        items: raw.orderItems.map(item => ({
          itemId: item.itemId,
          name: item.name,
          unitPriceCents: item.unitPrice,
          quantity: item.quantity,
          status: 'ACTIVE',
        })),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id
    )
  }

  static toPrismaWithItems(order: Order): Prisma.OrderUncheckedCreateInput {
    return {
      id: order.id,
      storeId: order.storeId,
      customerId: order.customerId ?? '00000000-0000-0000-0000-000000000000',
      code: order.code,
      status: order.status as PrismaOrderStatus,
      totalAmount: order.totalInCents,
      payAmount: order.totalInCents,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      orderItems: {
        create: order.items.map(item => ({
          itemId: item.itemId,
          name: item.name,
          unitPrice: item.unitPriceInCents,
          quantity: item.quantity,
           subtotal: item.unitPriceInCents * item.quantity,
        })),
      },
    }
  }

  static toPrismaWithoutItems(order: Order): Prisma.OrderUncheckedUpdateInput {
    return {
      customerId: order.customerId ?? undefined,
      code: order.code,
      status: order.status as PrismaOrderStatus,
      totalAmount: order.totalInCents,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }
  }

  static toPrismaOrderItemList(order: Order): Prisma.OrderItemUncheckedCreateInput[] {
    return order.items.map(item => ({
      orderId: order.id,
      itemId: item.itemId,
      name: item.name,
      unitPrice: item.unitPriceInCents,
      quantity: item.quantity,
      subtotal: item.unitPriceInCents * item.quantity,
    }))
  }
}
