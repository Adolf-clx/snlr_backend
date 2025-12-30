import { CustomerRepository } from '@/application/customer/repositories/customer-repository'
import { ItemRepository } from '@/application/item/repositories/item-repository'
import { Order } from '@/domain/order/order'
import { OrderItemCreateProps } from '@/domain/order/value-objects/order-item'
import { DomainEventPublisher } from '@/shared/kernel/events/domain-event-publisher'
import { Injectable } from '@nestjs/common'
import { Span } from 'nestjs-otel'
import { OrderRepository } from '../repositories/order-repository'

interface CreateOrderItemInput {
  itemId: string
  quantity: number
}

interface CreateOrderInput {
  storeId: string
  customerId?: string | null
  items: CreateOrderItemInput[]
}

interface CreateOrderOutput {
  order: Order
}

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly itemRepository: ItemRepository
  ) {}

  @Span()
  async execute(input: CreateOrderInput): Promise<CreateOrderOutput> {
    if (!input.items || input.items.length === 0) throw new Error('At least one item is required')
    if (input.customerId) {
      const existingCustomer = await this.customerRepository.findById(input.customerId)
      if (!existingCustomer) throw new Error('Customer not found')
    }
    const enrichedItems: OrderItemCreateProps[] = await Promise.all(
      input.items.map(async item => {
        const existingItem = await this.itemRepository.findById(item.itemId)
        if (!existingItem) throw new Error(`Item '${item.itemId}' does not exist`)
        if (!existingItem.isActive) throw new Error(`Item '${item.itemId}' is not available`)
        return {
          itemId: existingItem.id,
          name: existingItem.name,
          unitPriceDecimal: existingItem.price,
          quantity: item.quantity,
        }
      })
    )
    const order = Order.create({
      storeId: input.storeId,
      customerId: input.customerId ?? undefined,
      items: enrichedItems,
    })
    await this.orderRepository.save(order)
    DomainEventPublisher.instance.publishAggregateEvents(order)
    return {
      order,
    }
  }
}
