import { AggregateRoot } from '@/shared/kernel/entities/aggregate-root'
import { Amount } from '@/shared/kernel/value-objects/amount'
import { UniqueEntityID } from '@/shared/kernel/value-objects/unique-entity-id'
import { OrderCreatedEvent } from './events/order-created-event'
import { OrderStatusFactory } from './factories/order-satus-factory'
import { OrderCode } from './value-objects/order-code'
import { OrderItem, type OrderItemCreateProps, type OrderItemRestoreProps, OrderItemStatusEnum } from './value-objects/order-item'
import { OrderStatus } from './value-objects/order-status/order-status'
import { OrderStatusPaymentPending } from './value-objects/order-status/order-status-payment-pending'

export interface OrderProps {
  storeId: string
  customerId: UniqueEntityID | null
  code: OrderCode
  status: OrderStatus
  total: Amount
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateOrderProps {
  storeId: string
  customerId?: string
  code?: string
  status?: string
  items: OrderItemCreateProps[]
  createdAt?: Date
  updatedAt?: Date
}

interface RestoreOrderProps {
  storeId: string
  customerId?: string
  code: string
  status: string
  items: OrderItemRestoreProps[]
  total: number
  createdAt: Date
  updatedAt: Date
}

export class Order extends AggregateRoot<OrderProps> {
  get storeId(): string {
    return this.props.storeId
  }

  get customerId(): string | null {
    return this.props.customerId?.value ?? null
  }

  get code(): string {
    return this.props.code.value
  }

  get status(): string {
    return this.props.status.value()
  }

  get totalInDecimal(): number {
    return this.props.total.decimal
  }

  get totalInCents(): number {
    return this.props.total.cents
  }

  get items(): OrderItem[] {
    return this.props.items
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  touch(): void {
    this.props.updatedAt = new Date()
  }

  static create(props: CreateOrderProps, id?: string): Order {
    const items = props.items.map(OrderItem.create)
    const total = Order.calculateTotal(items)
    const status = props.status ? OrderStatusFactory.from(props.status) : new OrderStatusPaymentPending()
    const order = new Order(
      {
        storeId: props.storeId,
        customerId: props.customerId ? UniqueEntityID.create(props.customerId) : null,
        code: OrderCode.create(props.code),
        status,
        items,
        total,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      UniqueEntityID.create(id)
    )
    order.addDomainEvent(this.createOrderCreatedEvent(order))
    return order
  }

  static restore(props: RestoreOrderProps, id: string): Order {
    const items = props.items.map(OrderItem.restore)
    return new Order(
      {
        storeId: props.storeId,
        customerId: props.customerId ? UniqueEntityID.restore(props.customerId) : null,
        code: OrderCode.restore(props.code),
        status: OrderStatusFactory.from(props.status),
        items,
        total: Amount.createFromCents(props.total),
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
      },
      UniqueEntityID.restore(id)
    )
  }

  pay() {
    this.props.status.pay(this)
  }

  prepare() {
    this.props.status.prepare(this)
  }

  ready() {
    this.props.status.ready(this)
  }

  complete() {
    this.props.status.complete(this)
  }

  cancel() {
    this.props.status.cancel(this)
  }

  changeStatus(newStatus: OrderStatus) {
    this.props.status = newStatus
    this.touch()
  }

  updateItem(itemId: string, options: Partial<Pick<OrderItemCreateProps, 'quantity' | 'status'>>) {
    const index = this.props.items.findIndex(item => item.itemId === itemId)
    if (index === -1) throw new Error('Item not found')
    let item = this.props.items[index]
    if (options.status) item = item.updateStatus(OrderItem.parseStatus(options.status))
    if (typeof options.quantity === 'number') item = item.updateQuantity(options.quantity)
    this.props.items[index] = item
    this.recalculateTotal()
    this.touch()
  }

  private recalculateTotal(): void {
    this.props.total = Order.calculateTotal(this.props.items)
  }

  private static calculateTotal(items: OrderItem[]): Amount {
    return items
      .filter(i => i.status === OrderItemStatusEnum.ACTIVE)
      .map(i => Amount.createFromCents(i.unitPriceInCents).multiply(i.quantity))
      .reduce((sum, amt) => sum.add(amt), Amount.createFromCents(0))
  }

  private static createOrderCreatedEvent(order: Order) {
    return new OrderCreatedEvent({
      orderId: order.id,
      total: order.totalInCents,
    })
  }
}
