import { CategoryRepository } from '@/application/category/repositories/category-repository'
import { Item } from '@/domain/item/item'                 // 商品领域实体
import { Injectable } from '@nestjs/common'
import { Span } from 'nestjs-otel'                         // OpenTelemetry 链路追踪装饰器
import { ItemRepository } from '../repositories/item-repository'

/**
 * 创建商品的输入 DTO（Data Transfer Object）
 * 
 * 定义了调用本用例时需要提供的所有必要信息
 */
interface CreateItemInput {
  storeId: string        // 所属店铺 ID（必填）
  code: string           // 商品编码（必填，全局唯一，用于业务唯一性检查）
  name: string           // 商品名称（必填）
  description: string    // 商品描述（必填）
  price: number          // 商品价格（十进制，如 29.99，必填）
  categoryId: string     // 商品分类 ID（必填）
}

/**
 * 创建商品用例（Use Case）
 * 
 * 属于应用服务层（Application Service），负责协调：
 * - 商品仓储（ItemRepository）
 * - 分类仓储（CategoryRepository）
 * - 商品领域实体（Item）的创建
 * 
 * 主要职责：
 * 1. 检查商品编码是否已存在（唯一性约束）
 * 2. 验证分类是否存在
 * 3. 使用领域实体的工厂方法创建 Item（内部会进行值对象验证）
 * 4. 持久化新商品
 * 
 * 该用例通常被 Controller 调用，用于处理“新增商品”API 请求
 */
@Injectable() // NestJS 标记该类可被依赖注入
export class CreateItemUseCase {
  /**
   * 构造函数注入所需的仓储
   * NestJS 会自动提供实现类（如 PrismaItemRepository、PrismaCategoryRepository）
   */
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  /**
   * 执行创建商品的核心方法
   * 
   * @param input 创建商品所需的完整输入数据
   * @returns Promise<void> 创建成功无返回值
   * @throws Error 商品编码已存在、分类不存在、值对象验证失败等业务错误
   * 
   * @Span() 说明：
   * 为整个方法创建一个追踪跨度（span），记录执行耗时和上下文
   * 可在分布式追踪系统（Jaeger、Zipkin 等）中观察创建商品操作的性能和调用链
   * 如需更细粒度追踪，可改为动态添加属性：
   * @Span(({ storeId, code }) => ({ attributes: { storeId, itemCode: code } }))
   */
  @Span() // 方法级链路追踪
  async execute(input: CreateItemInput): Promise<void> {
    // 1. 检查商品编码是否已存在（业务唯一性规则）
    // 注意：这里假设编码在全局唯一（或店铺内唯一），根据实际业务调整
    const existingItem = await this.itemRepository.existsByCode(input.code)
    if (existingItem) {
      throw new Error(`Item with code '${input.code}' already exists`)
    }

    // 2. 验证分类是否存在（外键完整性检查）
    const existingCategory = await this.categoryRepository.findById(input.categoryId)
    if (!existingCategory) {
      throw new Error('Category not found')
    }

    // 3. 使用领域实体的静态工厂方法创建商品
    // Item.create() 会：
    //   - 自动生成 ID（如果未传）
    //   - 创建并验证所有值对象（ItemCode、ItemName、ItemDescription、Amount 等）
    //   - 设置默认值（isActive: true, createdAt/updatedAt 等）
    //   - 如果值对象验证失败，会抛出相应的领域错误
    const item = Item.create(input)

    // 4. 持久化新创建的商品实体
    await this.itemRepository.save(item)
  }
}