import { makeItem } from 'test/factories/make-item'
import { InMemoryItemRepository } from 'test/repositories/in-memory-item-repository'
import { GetItemByIdUseCase } from './get-item-by-id'

// 测试变量声明
let itemRepository: InMemoryItemRepository
let sut: GetItemByIdUseCase // sut = System Under Test（被测对象）

/**
 * GetItemByIdUseCase 单元测试套件
 * 
 * 使用 InMemoryItemRepository 进行内存级隔离测试
 * 目的：验证根据 ID 查询单个商品的业务逻辑是否正确
 * 覆盖场景：
 * - 商品存在时成功返回完整 Item 实体
 * - 商品不存在时抛出明确错误
 */
describe('Get Item By Id Use Case', () => {
  /**
   * 每个测试用例执行前重新初始化仓储和用例实例
   * 确保测试之间相互隔离，不受之前状态影响
   */
  beforeEach(() => {
    itemRepository = new InMemoryItemRepository()
    sut = new GetItemByIdUseCase(itemRepository)
  })

  /**
   * 成功场景：根据 ID 正确返回已存在的商品
   * 验证返回的 item 与保存的是同一个实体实例（引用相等）
   */
  it('should return the item if it exists', async () => {
    // 准备数据：创建一个商品并保存到内存仓储
    const item = makeItem(
      {
        name: 'Test Item',
        price: 29.99,
        isActive: true,
      },
      'item-1' // 指定固定 ID，便于查询
    )
    await itemRepository.save(item)

    // 执行查询用例
    const result = await sut.execute({ itemId: 'item-1' })

    // 断言：输出结构正确，且返回的是同一个实体实例
    expect(result).toEqual({ item })
    expect(result.item).toBe(item) // 引用相等（仓储返回的就是同一个对象）
    expect(result.item.id.toString()).toBe('item-1') // ID 匹配
    expect(result.item.isDeleted()).toBe(false) // 默认未删除
  })

  /**
   * 错误场景：尝试查询一个不存在的商品 ID
   * 用例层应抛出清晰的业务错误 "Item not found"
   */
  it('should throw error if item does not exist', async () => {
    // 不保存任何商品，直接查询一个不存在的 ID
    const nonExistentId = 'non-existent-id'

    // 正确写法：await expect(...).rejects.toThrowError()
    await expect(
      sut.execute({ itemId: nonExistentId })
    ).rejects.toThrowError('Item not found')

    // 可选：额外验证仓储中确实没有该商品（加强信心）
    expect(itemRepository.items).toHaveLength(0)
  })

  // 可选扩展测试：如果你希望确保软删除的商品也能被查询到（一般业务是允许的）
  /**
   * 额外场景：软删除的商品仍然可以被查询到（根据业务需求）
   * 注意：GetItemById 通常不应过滤 deletedAt，除非有明确需求
   */
  it('should return a soft-deleted item if it exists', async () => {
    const deletedItem = makeItem({ deletedAt: new Date() }, 'deleted-item-1')
    await itemRepository.save(deletedItem)

    const result = await sut.execute({ itemId: 'deleted-item-1' })

    expect(result.item).toBe(deletedItem)
    expect(result.item.isDeleted()).toBe(true)
  })
})