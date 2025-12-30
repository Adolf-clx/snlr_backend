import { Entity } from '@/shared/kernel/entities/entity'
import { UniqueEntityID } from '@/shared/kernel/value-objects/unique-entity-id'
import { Document } from './value-objects/document'     // 未使用（可能预留）
import { Email } from './value-objects/email'           // 未使用（可能预留）
import { Name } from './value-objects/name'             // 未使用（可能预留）

/**
 * Customer 实体属性接口
 * 
 * 定义了客户的核心业务属性
 * 注意：当前版本较为简洁，仅包含昵称、手机号和创建时间
 * 未来可扩展 Document、Email、Name 等值对象
 */
export interface CustomerProps {
  nickname: string         // 客户昵称（字符串，暂未使用值对象封装）
  phone: string            // 客户手机号（字符串，暂未使用值对象封装）
  createdAt: Date          // 创建时间（不可变，由工厂方法设置）
}

/**
 * 新建客户时传入的原始属性
 * 
 * 使用原始类型，便于从外部（如 Controller、DTO）接收数据
 */
export interface CreateCustomerProps {
  nickname: string
  phone: string
  createdAt?: Date         // 可选，默认为当前时间
}

/**
 * 从持久化层恢复客户时使用的属性
 * 
 * 所有字段必填（数据库中已有值），用于仓储（Repository）映射
 */
interface RestoreCustomerProps {
  nickname: string
  phone: string
  createdAt: Date          // 必须提供（历史记录）
}

/**
 * 客户实体类（Customer Entity）
 * 
 * 采用 DDD 领域驱动设计中的 Entity 模式
 * 
 * 特点：
 * - 继承自共享内核的 Entity 基类，具备 ID 管理和相等性判断
 * - 属性通过 props 私有持有，不可外部直接修改（封装性）
 * - 只有通过工厂方法 create / restore 创建实例
 * - 当前为简单实体，未来可添加更多业务行为（如修改昵称、绑定邮箱等）
 */
export class Customer extends Entity<CustomerProps> {
  /** 客户昵称（只读） */
  get nickname(): string {
    return this.props.nickname
  }

  /** 客户手机号（只读） */
  get phone(): string {
    return this.props.phone
  }

  /** 创建时间（只读） */
  get createdAt(): Date {
    return this.props.createdAt
  }

  /**
   * 工厂方法：用于创建新客户（适用于新建场景）
   * 
   * @param props 创建所需数据
   * @param id 可选自定义 ID，若不传由 UniqueEntityID 自动生成
   * @returns Customer 实例
   * 
   * 注意：
   * - createdAt 默认为 new Date()，确保新建时时间准确
   * - 未进行昵称/手机号的格式校验（可后续引入值对象）
   */
  static create(props: CreateCustomerProps, id?: string): Customer {
    return new Customer(
      {
        nickname: props.nickname,
        phone: props.phone,
        createdAt: props.createdAt ?? new Date(), // 默认当前时间
      },
      UniqueEntityID.create(id)
    )
  }

  /**
   * 工厂方法：用于从数据库或其他持久化层恢复客户实体
   * 
   * @param props 持久化数据（所有字段必填）
   * @param id 数据库中的 ID（必填）
   * @returns Customer 实例
   * 
   * 用途：仓储层将数据库记录映射回领域实体时使用
   * 跳过默认值逻辑，直接使用历史数据
   */
  static restore(props: RestoreCustomerProps, id: string): Customer {
    return new Customer(
      {
        nickname: props.nickname,
        phone: props.phone,
        createdAt: props.createdAt,
      },
      UniqueEntityID.restore(id) // 使用已存在的 ID
    )
  }
}