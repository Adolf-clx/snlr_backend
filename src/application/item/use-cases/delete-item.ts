import { Injectable } from '@nestjs/common'
import { Span } from 'nestjs-otel'                       // OpenTelemetry 链路追踪装饰器
import { ItemRepository } from '../repositories/item-repository'

/**
 * 软删除商品的输入 DTO（Data Transfer Object）
 * 
 * 只需提供要删除的商品 ID
 */
interface DeleteItemInput {
  itemId: string         // 商品 ID（必填）
}

/**
 * 软删除商品用例（Use Case）
 * 
 * 属于应用服务层（Application Service），负责协调：
 * - 商品仓储（ItemRepository）
 * - 商品领域实体（Item）的软删除操作
 * 
 * 主要职责：
 * 1. 根据 ID 查找商品，确保存在
 * 2. 调用领域实体的 softDelete() 方法（设置 deletedAt 时间戳）
 * 3. 通过仓储持久化删除状态（通常是 update 操作，因为是软删除）
 * 
 * 注意：
 * - 这是一个**软删除**操作，不会物理删除数据库记录
 * - 领域实体会自动调用 touch() 更新 updatedAt 时间戳
 * - 如果商品已经删除，实体会抛出 "Item already deleted" 错误
 */
@Injectable() // NestJS 标记该类可被依赖注入（通常注入到 Controller 中）
export class DeleteItemUseCase {
  /**
   * 构造函数注入 ItemRepository
   * NestJS 会自动提供具体实现（如 PrismaItemRepository）
   */
  constructor(private readonly itemRepository: ItemRepository) {}

  /**
   * 执行软删除商品的核心方法
   * 
   * @param input 包含 itemId 的输入对象
   * @returns Promise<void> 删除成功无返回值
   * @throws Error 商品不存在、商品已删除（由实体抛出）或其他错误
   * 
   * @Span 高级用法说明：
   * 使用函数形式动态为 OpenTelemetry Span 添加属性 itemId
   * 在 Jaeger/Zipkin 等追踪系统中，可以直接按 itemId 过滤查看删除操作
   * 便于审计（谁删了哪个商品、何时删除）和问题排查
   */
  @Span(({ itemId }) => ({ attributes: { itemId } })) // 将 itemId 记录到追踪属性中
  async execute({ itemId }: DeleteItemInput): Promise<void> {
    // 1. 根据 ID 查询商品
    const item = await this.itemRepository.findById(itemId)

    // 2. 如果商品不存在，抛出业务异常
    if (!item) {
      throw new Error('Item not found')
    }

    // 3. 执行软删除
    // Item.softDelete() 内部会：
    //   - 检查是否已删除（已删除则抛错）
    //   - 设置 deletedAt = new Date()
    //   - 调用 touch() 更新 updatedAt
    item.softDelete()

    // 4. 持久化删除状态
    // 注意：这里调用的是 delete 方法，但实际大多数仓储实现中软删除是 update 操作
    // 建议仓储接口统一为 update(item) 以避免混淆（或改名为 softDelete）
    await this.itemRepository.delete(item)
  }
}