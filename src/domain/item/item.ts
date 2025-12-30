import { Entity } from '@/shared/kernel/entities/entity'
import { Amount } from '@/shared/kernel/value-objects/amount'
import { UniqueEntityID } from '@/shared/kernel/value-objects/unique-entity-id'
import { ItemCategoryId } from './value-objects/item-category-id'
import { ItemCode } from './value-objects/item-code'
import { ItemDescription } from './value-objects/item-description'
import { ItemName } from './value-objects/item-name'

/**
 * Item 实体接口，定义商品的所有属性
 */
export interface ItemProps {
  storeId: string                          // 所属店铺 ID
  code: ItemCode                           // 商品编码（值对象，确保格式合法）
  name: ItemName                           // 商品名称（值对象）
  description: ItemDescription             // 商品描述（值对象）
  price: Amount                            // 商品价格（值对象，支持小数和分两种形式）
  isActive: boolean                        // 是否激活（在未软删除的情况下决定商品是否可用）
  categoryId: ItemCategoryId               // 商品分类 ID（值对象）
  createdAt: Date                          // 创建时间
  updatedAt: Date                          // 最后更新时间
  deletedAt: Date | null                   // 软删除时间，null 表示未删除
}

/**
 * 创建新商品时传入的原始属性（使用原始类型而非值对象）
 */
export interface CreateItemProps {
  storeId: string
  code: string
  name: string
  description: string
  price: number                            // 十进制价格（如 19.99）
  isActive?: boolean                       // 可选，默认为 true
  categoryId: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}

/**
 * 从持久化层恢复（restore）商品时使用的属性
 * 与 CreateItemProps 不同的是 price 使用 cents（整数）形式，且某些字段必填
 */
interface RestoreItemProps {
  storeId: string
  code: string
  name: string
  description: string
  price: number                            // 这里使用 cents（整数分）形式
  isActive: boolean
  categoryId: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

/**
 * 更新商品时允许修改的字段（部分可选）
 */
type UpdateItemProps = Partial<Pick<CreateItemProps, 'name' | 'description' | 'price' | 'categoryId'>>

/**
 * 商品实体类
 * 采用 DDD 领域驱动设计中的 Entity 模式，封装商品的所有业务规则和状态
 */
export class Item extends Entity<ItemProps> {
  /** 所属店铺 ID（只读） */
  get storeId(): string {
    return this.props.storeId
  }

  /** 商品编码（值对象的原始值） */
  get code(): string {
    return this.props.code.value
  }

  /** 商品名称 */
  get name(): string {
    return this.props.name.value
  }

  /** 商品描述 */
  get description(): string {
    return this.props.description.value
  }

  /** 商品价格（十进制形式，如 19.99） */
  get price(): number {
    return this.props.price.decimal
  }

  /** 商品价格（整数分形式，如 1999 表示 19.99） */
  get priceInCents(): number {
    return this.props.price.cents
  }

  /** 商品分类 ID */
  get categoryId(): string {
    return this.props.categoryId.value
  }

  /** 是否处于激活状态（未软删除且 isActive 为 true） */
  get isActive(): boolean {
    return !this.isDeleted() && this.props.isActive
  }

  /** 创建时间 */
  get createdAt(): Date {
    return this.props.createdAt
  }

  /** 最后更新时间 */
  get updatedAt(): Date {
    return this.props.updatedAt
  }

  /** 软删除时间（null 表示未删除） */
  get deletedAt(): Date | null {
    return this.props.deletedAt
  }

  /** 更新 updatedAt 时间戳，通常在任何修改操作后调用 */
  touch(): void {
    this.props.updatedAt = new Date()
  }

  /** 判断商品是否已被软删除 */
  isDeleted(): boolean {
    return this.props.deletedAt !== null
  }

  /** 判断商品是否可用（未删除且激活） */
  isAvailable(): boolean {
    return !this.isDeleted() && this.props.isActive
  }

  /** 停用商品（将 isActive 设为 false） */
  deactivate(): void {
    if (this.isDeleted()) throw new Error('Item is deleted')
    if (!this.props.isActive) throw new Error('Item is already inactive')
    this.props.isActive = false
    this.touch()
  }

  /** 重新激活商品 */
  reactivate(): void {
    if (this.isDeleted()) throw new Error('Cannot reactivate a deleted item')
    if (this.props.isActive) throw new Error('Item is already active')
    this.props.isActive = true
    this.touch()
  }

  /** 软删除商品（设置 deletedAt 时间） */
  softDelete(): void {
    if (this.isDeleted()) throw new Error('Item already deleted')
    this.props.deletedAt = new Date()
    this.touch()
  }

  /** 恢复软删除的商品 */
  restoreDeletion(): void {
    if (!this.isDeleted()) throw new Error('Item is not deleted')
    this.props.deletedAt = null
    this.touch()
  }

  /**
   * 创建新商品的工厂方法
   * @param props 创建所需原始数据
   * @param id 可选的自定义 ID，若不传会自动生成
   * @returns Item 实例
   */
  static create(props: CreateItemProps, id?: string): Item {
    return new Item(
      {
        storeId: props.storeId,
        code: ItemCode.create(props.code),
        name: ItemName.create(props.name),
        description: ItemDescription.create(props.description),
        price: Amount.createFromDecimal(props.price),
        isActive: props.isActive ?? true,
        categoryId: ItemCategoryId.create(props.categoryId),
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
      },
      UniqueEntityID.create(id)
    )
  }

  /**
   * 从数据库或其他持久化层恢复商品的工厂方法
   * 常用于仓储（Repository）将数据库记录映射回领域实体
   */
  static restore(props: RestoreItemProps, id: string): Item {
    return new Item(
      {
        storeId: props.storeId,
        code: ItemCode.create(props.code),
        name: ItemName.create(props.name),
        description: ItemDescription.create(props.description),
        // 注意：这里使用 cents 形式创建 Amount
        price: Amount.createFromCents(props.price),
        isActive: props.isActive,
        categoryId: ItemCategoryId.create(props.categoryId),
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
        deletedAt: props.deletedAt ?? null,
      },
      UniqueEntityID.create(id)
    )
  }

  /**
   * 更新商品信息
   * 只允许更新名称、描述、价格、分类，其他字段不可通过此方法修改
   * @param props 需要更新的字段（部分可选）
   */
  public update(props: UpdateItemProps): void {
    if (this.isDeleted()) throw new Error('Cannot update a deleted item')
    if (props.name) this.props.name = ItemName.create(props.name)
    if (props.description) this.props.description = ItemDescription.create(props.description)
    if (props.price !== undefined) this.props.price = Amount.createFromDecimal(props.price)
    if (props.categoryId) this.props.categoryId = ItemCategoryId.create(props.categoryId)
    this.touch()
  }
}