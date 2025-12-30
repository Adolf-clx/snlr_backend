import { makeItem } from 'test/factories/make-item'
import { InMemoryItemRepository } from 'test/repositories/in-memory-item-repository'
import { RestoreItemUseCase } from './restore-item'

// 测试变量声明
let itemRepository: InMemoryItemRepository
let sut: RestoreItemUseCase // sut = System Under Test（被测对象）

/**
 * RestoreItemUseCase 单元测试套件
 * 
 * 使用 InMemoryItemRepository 进行内存级隔离测试
 * 目的：验证恢复软删除商品的业务逻辑是否正确
 * 覆盖场景：
 * - 成功恢复已删除的商品
 * - 商品不存在时抛出错误
 * - 商品未被删除（正常状态）时尝试恢复抛出错误
 * - 恢复后时间戳和可用性状态正确更新
 */
describe('Restore Item Use Case', () => {
  /**
   * 每个测试用例执行前重新创建仓储和用例实例
   * 确保测试之间完全隔离，避免状态污染
   */
  beforeEach(() => {
    itemRepository = new InMemoryItemRepository()
    sut = new RestoreItemUseCase(itemRepository)
  })

  /**
   * 成功场景：恢复一个已被软删除的商品
   * 验证 deletedAt 被清除，并检查 updatedAt 是否被更新
   */
  it('should successfully restore a soft-deleted item', async () => {
    // 准备：创建一个已软删除的商品
    const deletedItem = makeItem(
      { deletedAt: new Date() }, // 设置 deletedAt 表示已删除
      'item-1'
    )
    await itemRepository.save(deletedItem)

    // 执行恢复操作
    await sut.execute({ itemId: 'item-1' })

    // 断言：商品的 deletedAt 应被置为 null
    const restoredItem = itemRepository.items[0]
    expect(restoredItem.deletedAt).toBeNull()
    expect(restoredItem.isDeleted()).toBe(false)

    // 额外验证：恢复操作应触发 touch()，更新 updatedAt 时间戳
    expect(restoredItem.updatedAt.getTime()).toBeGreaterThan(restoredItem.createdAt.getTime())
  })

  /**
   * 错误场景：尝试恢复一个不存在的商品
   * 用例层会先调用 findById 返回 null，然后抛出 "Item not found"
   */
  it('should throw error when trying to restore a non-existent item', async () => {
    await expect(
      sut.execute({ itemId: 'non-existent-item' })
    ).rejects.toThrowError('Item not found')
  })

  /**
   * 错误场景：尝试恢复一个未被删除的商品（正常激活状态）
   * 用例层能找到商品，但 Item.restoreDeletion() 会校验并抛出领域错误
   */
  it('should throw error when trying to restore an item that is not deleted', async () => {
    // 准备：创建一个正常状态的商品（deletedAt 为 null）
    await itemRepository.save(makeItem({}, 'item-1'))

    await expect(
      sut.execute({ itemId: 'item-1' })
    ).rejects.toThrowError('Item is not deleted')
  })

  /**
   * 额外场景：恢复后，如果商品之前是激活状态，应重新变为可用
   * 验证 isAvailable() 的逻辑正确性
   */
  it('should make the item available again if it was active before deletion', async () => {
    // 创建一个激活状态的商品，然后手动软删除
    const item = makeItem({ isActive: true }, 'item-1')
    item.softDelete() // 模拟删除操作
    await itemRepository.save(item)

    // 执行恢复
    await sut.execute({ itemId: 'item-1' })

    const restoredItem = itemRepository.items[0]
    expect(restoredItem.isDeleted()).toBe(false)
    expect(restoredItem.isActive).toBe(true)     // 激活状态未变
    expect(restoredItem.isAvailable()).toBe(true) // 未删除 + 激活 = 可用
  })
})