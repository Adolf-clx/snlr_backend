import { Item } from '@/domain/item/item'
import { makeCategory } from 'test/factories/make-category'
import { makeItem } from 'test/factories/make-item' // 推荐使用工厂，避免手动构造绕过规则
import { InMemoryCategoryRepository } from 'test/repositories/in-memory-category-repository'
import { InMemoryItemRepository } from 'test/repositories/in-memory-item-repository'
import { CreateItemUseCase } from './create-item'

// 测试变量
let itemRepository: InMemoryItemRepository
let categoryRepository: InMemoryCategoryRepository
let sut: CreateItemUseCase // System Under Test（被测对象）

/**
 * CreateItemUseCase 单元测试套件
 * 
 * 使用内存仓储进行隔离测试
 * 验证创建商品的业务逻辑，包括：
 * - 成功创建商品并设置默认值
 * - 商品编码重复时抛错
 * - 分类不存在时抛错
 */
describe('Create Item Use Case', () => {
  /**
   * 每个测试前重新初始化仓储和用例实例
   * 确保测试之间完全隔离
   */
  beforeEach(() => {
    itemRepository = new InMemoryItemRepository()
    categoryRepository = new InMemoryCategoryRepository()
    sut = new CreateItemUseCase(itemRepository, categoryRepository)
  })

  /**
   * 成功场景：创建商品，所有字段正确保存，默认值生效
   */
  it('should successfully create a new item with valid input', async () => {
    // 准备：创建一个有效的分类
    const category = makeCategory({}, 'category-1')
    await categoryRepository.save(category)

    // 输入数据（注意：storeId 是必填字段）
    const input = {
      storeId: 'store-123', // 必须提供
      code: 'CODE-001',
      name: 'Premium T-Shirt',
      description: 'High quality cotton t-shirt',
      price: 29.99,
      categoryId: 'category-1',
    }

    // 执行创建
    await sut.execute(input)

    // 断言：仓储中应有 1 条记录
    expect(itemRepository.items).toHaveLength(1)

    const createdItem = itemRepository.items[0]

    // 验证关键字段
    expect(createdItem.code).toBe('CODE-001')
    expect(createdItem.name).toBe('Premium T-Shirt')
    expect(createdItem.description).toBe('High quality cotton t-shirt')
    expect(createdItem.price).toBe(29.99)
    expect(createdItem.priceInCents).toBe(2999) // 验证 Amount 值对象转换
    expect(createdItem.categoryId).toBe('category-1')
    expect(createdItem.storeId).toBe('store-123')

    // 验证默认值
    expect(createdItem.isActive).toBe(true)
    expect(createdItem.isAvailable()).toBe(true)
    expect(createdItem.isDeleted()).toBe(false)
    expect(createdItem.createdAt).toBeInstanceOf(Date)
    expect(createdItem.updatedAt).toBeInstanceOf(Date)
    expect(createdItem.deletedAt).toBeNull()
  })

  /**
   * 错误场景：商品编码已存在（唯一性约束）
   */
  it('should throw error when trying to create an item with duplicate code', async () => {
    // 准备：先创建一个分类
    await categoryRepository.save(makeCategory({}, 'category-1'))

    // 第一次创建成功（建立重复基础）
    const input = {
      storeId: 'store-123',
      code: 'DUPLICATE-CODE',
      name: 'First Item',
      description: 'Description',
      price: 19.99,
      categoryId: 'category-1',
    }

    await sut.execute(input) // 第一次成功

    // 第二次使用相同 code 应失败
    await expect(sut.execute(input)).rejects.toThrowError(
      "Item with code 'DUPLICATE-CODE' already exists"
    )

    // 仓储中仍只有 1 条记录（事务性保证）
    expect(itemRepository.items).toHaveLength(1)
  })

  /**
   * 错误场景：指定的分类不存在
   */
  it('should throw error when the provided category does not exist', async () => {
    const input = {
      storeId: 'store-123',
      code: 'CODE-002',
      name: 'Invalid Category Item',
      description: 'Description',
      price: 15.5,
      categoryId: 'non-existent-category', // 不存在的分类 ID
    }

    // 未预先创建任何分类，直接执行应抛错
    await expect(sut.execute(input)).rejects.toThrowError('Category not found')

    // 仓储中没有新增记录
    expect(itemRepository.items).toHaveLength(0)
  })
})