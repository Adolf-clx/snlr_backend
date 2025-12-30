import { Item } from '@/domain/item/item'               // 商品领域实体
import { Injectable } from '@nestjs/common'
import { Span } from 'nestjs-otel'                       // OpenTelemetry 链路追踪装饰器
import { ItemRepository } from '../repositories/item-repository'

/**
 * 根据 ID 查询商品的输入 DTO（Data Transfer Object）
 * 
 * 只需提供商品 ID
 */
interface GetItemByIdInput {
  itemId: string         // 商品 ID（必填）
}

/**
 * 根据 ID 查询商品的输出 DTO
 * 
 * 返回完整的 Item 领域实体对象
 */
interface GetItemByIdOutput {
  item: Item             // 查询到的商品实体
}

/**
 * 根据 ID 获取商品用例（Use Case）
 * 
 * 属于应用服务层（Application Service），负责：
 * - 接收 itemId 参数
 * - 通过仓储查询商品
 * - 如果不存在则抛出错误
 * - 返回商品实体
 * 
 * 该用例通常被 Controller 调用，用于 API 接口“获取单个商品详情”
 */
@Injectable() // NestJS 标记该类可被依赖注入
export class GetItemByIdUseCase {
  /**
   * 构造函数注入 ItemRepository
   * NestJS 会自动提供具体实现（如 PrismaItemRepository）
   */
  constructor(private readonly itemRepository: ItemRepository) {}

  /**
   * 执行查询的核心方法
   * 
   * @param input 包含 itemId 的输入对象
   * @returns Promise<GetItemByIdOutput> 包含查询到的 item
   * @throws Error 如果商品不存在（"Item not found"）
   * 
   * @Span 高级用法说明：
   * 使用函数形式动态为 OpenTelemetry Span 添加属性 itemId
   * 在分布式追踪系统（如 Jaeger、Zipkin）中，可以直接按 itemId 过滤查看
   * 便于监控哪些商品被频繁查询、查询耗时等信息
   */
  @Span(({ itemId }) => ({ attributes: { itemId } })) // 将 itemId 记录到追踪属性中
  async execute({ itemId }: GetItemByIdInput): Promise<GetItemByIdOutput> {
    // 1. 通过仓储根据 ID 查询商品实体
    const item = await this.itemRepository.findById(itemId)

    // 2. 如果未找到，抛出业务异常（Controller 层可捕获转为 404）
    if (!item) {
      throw new Error('Item not found')
    }

    // 3. 返回查询结果
    return {
      item,
    }
  }
}