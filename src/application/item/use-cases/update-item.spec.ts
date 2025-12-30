import { makeCategory } from 'test/factories/make-category'
import { makeItem } from 'test/factories/make-item'
import { InMemoryCategoryRepository } from 'test/repositories/in-memory-category-repository'
import { InMemoryItemRepository } from 'test/repositories/in-memory-item-repository'
import { sleep } from 'test/utils/sleep'
import { UpdateItemUseCase } from './update-item'

// 测试中使用的变量（System Under Test 缩写为 sut）
let itemRepository: InMemoryItemRepository
let categoryRepository: InMemoryCategoryRepository
let sut: UpdateItemUseCase

/**
 * UpdateItemUseCase 单元测试
 * 
 * 使用 In-Memory 仓储进行隔离测试，不依赖真实数据库
 * 验证用例的业务逻辑是否正确，包括：
 * - 正常更新字段
 * - 激活/停用状态切换
 * - 各种错误场景（如商品不存在、分类不存在、商品已删除）
 */
describe('Update Item Use Case', () => {
  /**
   * 每个测试用例执行前都会重新初始化仓储和用例实例
   * 保证测试之间互不影响（隔离性）
   */
  beforeEach(() => {
    itemRepository = new InMemoryItemRepository()
    categoryRepository = new InMemoryCategoryRepository()
    sut = new UpdateItemUseCase(itemRepository, categoryRepository)
  })

  /**
   * 主要场景：成功更新商品的多个字段（名称、描述、价格、分类、激活状态）
   * 同时验证 updatedAt 时间戳是否被正确更新
   */
  it('should update an item successfully with all fields', async () => {
    // 准备数据：创建一个分类供后续关联
    await categoryRepository.save(makeCategory({}, 'cat-2'))

    // 创建并保存一个初始商品
    await itemRepository.save(
      makeItem(
        {
          name: 'Item 1',
          description: 'Description 1',
          price: 10,
          isActive: true, // 初始为激活状态
        },
        'item-1'
      )
    )

    // 短暂等待，确保 createdAt 和 updatedAt 有时间差（用于后续断言）
    await sleep(10)

    // 执行更新操作
    const input = {
      itemId: 'item-1',
      name: 'Item Test',
      description: 'Description Test',
      price: 19,
      categoryId: 'cat-2',
      active: false, // 停用商品
    }

    await sut.execute(input)

    // 断言：所有字段都应被正确更新
    const updatedItem = itemRepository.items[0]
    expect(updatedItem.name).toBe('Item Test')
    expect(updatedItem.description).toBe('Description Test')
    expect(updatedItem.price).toBe(19)
    expect(updatedItem.categoryId).toBe('cat-2')
    expect(updatedItem.isActive).toBe(false) // 注意：使用 isActive getter
    expect(updatedItem.isAvailable()).toBe(false)

    // updatedAt 必须晚于 createdAt（证明 touch() 被调用）
    expect(updatedItem.updatedAt.getTime()).toBeGreaterThan(updatedItem.createdAt.getTime())
  })

  /**
   * 场景：商品当前为停用状态，传入 active: true 时应被重新激活
   */
  it('should reactivate item when active is set to true', async () => {
    // 创建一个初始停用的商品
    const item = makeItem({ isActive: false }, 'item-1')
    await itemRepository.save(item)

    // 执行激活操作
    await sut.execute({ itemId: 'item-1', active: true })

    const updatedItem = itemRepository.items[0]
    expect(updatedItem.isActive).toBe(true)
    expect(updatedItem.isAvailable()).toBe(true) // 未删除且激活 = 可用
  })

  /**
   * 错误场景：尝试更新一个不存在的商品
   */
  it('should throw error when item does not exist', async () => {
    await expect(() =>
      sut.execute({
        itemId: 'non-existent',
        name: 'Test',
      })
    ).rejects.toThrowError('Item not found')
  })

  /**
   * 错误场景：更新时指定了一个不存在的分类 ID
   */
  it('should throw error when category does not exist', async () => {
    const item = makeItem({}, 'item-1')
    await itemRepository.save(item)

    await expect(() =>
      sut.execute({
        itemId: 'item-1',
        categoryId: 'invalid-cat',
      })
    ).rejects.toThrowError('Category not found')
  })

  /**
   * 错误场景：尝试更新一个已被软删除的商品
   * 用例层会先检查 item.isDeleted() 并抛出异常
   */
  it('should throw error when trying to update a deleted item', async () => {
    const item = makeItem({ deletedAt: new Date() }, 'item-1') // 模拟已软删除
    await itemRepository.save(item)

    await expect(() =>
      sut.execute({
        itemId: 'item-1',
        name: 'test',
      })
    ).rejects.toThrowError('Cannot update a deleted item')
  })
})