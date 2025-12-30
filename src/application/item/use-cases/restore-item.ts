import { Injectable } from '@nestjs/common'
import { Span } from 'nestjs-otel'               // OpenTelemetry 链路追踪装饰器
import { ItemRepository } from '../repositories/item-repository'

/**
 * 恢复软删除商品的输入 DTO（Data Transfer Object）
 * 
 * 只需要提供要恢复的商品 ID
 */
interface RestoreItemInput {
  itemId: string         // 商品 ID（必填）
}

/**
 * 恢复软删除商品用例（Use Case）
 * 
 * 属于应用服务层（Application Service），负责协调：
 * - 商品仓储（ItemRepository）
 * - 商品领域实体（Item）的恢复删除操作
 * 
 * 主要职责：
 * 1. 根据 ID 查找商品，确保存在
 * 2. 调用领域实体的 restoreDeletion() 方法（会校验是否已删除，并清除 deletedAt）
 * 3. 持久化更新后的商品
 * 
 * 注意：如果商品未被软删除，领域实体会抛出错误（"Item is not deleted"）
 */
@Injectable() // NestJS 标记该类可被依赖注入（通常注入到 Controller 中使用）
export class RestoreItemUseCase {
  /**
   * 构造函数注入 ItemRepository
   * NestJS 会自动提供实现类（如 PrismaItemRepository）
   */
  constructor(private readonly itemRepository: ItemRepository) {}

  /**
   * 执行恢复软删除商品的核心方法
   * 
   * @param input 包含 itemId 的输入对象
   * @returns Promise<void> 恢复成功无返回值
   * @throws Error 商品不存在、商品未被删除（由实体抛出）或其他错误
   * 
   * @Span 高级用法说明：
   * 使用函数形式动态设置 Span 属性，将 itemId 添加到追踪信息中
   * 在 Jaeger/Zipkin 等追踪系统中，可以直接按 itemId 过滤查看恢复操作
   * 便于生产环境审计和问题排查（谁恢复了哪个商品、何时恢复等）
   */
  @Span(({ itemId }) => ({ attributes: { itemId } })) // 动态添加 itemId 到 OpenTelemetry Span 属性
  async execute({ itemId }: RestoreItemInput): Promise<void> {
    // 1. 根据 ID 查询商品
    const item = await this.itemRepository.findById(itemId)
    if (!item) {
      throw new Error('Item not found') // 商品不存在
    }

    // 2. 执行恢复删除操作
    // 此方法内部会检查 item.isDeleted() 是否为 true
    // 如果商品未被删除，会抛出 "Item is not deleted" 错误（领域规则保护）
    item.restoreDeletion()

    // 3. 更新持久化（清除 deletedAt 字段，并更新 updatedAt 时间戳）
    // 领域实体在 restoreDeletion() 中已调用 touch() 更新了 updatedAt
    await this.itemRepository.update(item)
  }
}