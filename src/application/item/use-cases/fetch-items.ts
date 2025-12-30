import { Item } from '@/domain/item/item'
import { PaginationOuput } from '@/shared/kernel/@types/pagination-output'
import { Injectable } from '@nestjs/common'
import { Span } from 'nestjs-otel'
import { FetchItemsSearchParams } from '../@types/fetch-items-search-filters'
import { ItemRepository } from '../repositories/item-repository'

/**
 * 获取商品列表（支持分页和筛选）的用例
 * 
 * 属于应用服务层，负责：
 * - 接收搜索参数（分页、筛选条件等）
 * - 调用仓储层查询商品列表和总数
 * - 计算分页元数据
 * - 返回标准化的分页响应结构
 * 
 * 典型使用场景：前端商品列表页、后台管理商品表格
 */
@Injectable()
export class FetchItemsUseCase {
  constructor(private readonly itemRepository: ItemRepository) {}

  /**
   * 执行查询商品列表的核心方法
   * 
   * @param input 搜索参数（分页信息 + 可选筛选条件）
   * @returns Promise<PaginationOuput<Item>> 包含商品列表和分页元数据的响应
   * 
   * @Span() 说明：
   * 为整个方法创建一个追踪跨度（span），记录执行耗时
   * 可在分布式追踪系统（Jaeger/Zipkin 等）中看到该查询的性能表现
   * 当前未添加动态属性，如需按店铺或分类追踪，可改为：
   * @Span(({ storeId, categoryId }) => ({ attributes: { storeId, categoryId } }))
   */
  @Span()
  async execute(input: FetchItemsSearchParams): Promise<PaginationOuput<Item>> {
    // 并行执行两条查询，提高效率
    // 1. 获取当前页的商品列表
    // 2. 获取符合条件的商品总数（用于计算总页数）
    const [items, total] = await Promise.all([
      this.itemRepository.findMany(input),
      this.itemRepository.count(input)
    ])

    // 分页参数处理：使用默认值防止传入 undefined
    const page = input.page ?? 1
    const perPage = input.perPage ?? 10

    // 计算总页数（向上取整）
    // 例如：25 条记录，每页 10 条 → 3 页
    const totalPages = Math.ceil(total / perPage)

    // 返回标准分页结构
    return {
      total,          // 符合条件的商品总数
      page,           // 当前页码（从 1 开始）
      perPage,        // 每页条数
      totalPages,     // 总页数
      data: items,    // 当前页的商品列表
    }
  }
}