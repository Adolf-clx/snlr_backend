import { Item } from './item'

const makeValidProps = () => ({
  storeId: 'store-123',
  code: 'ITEM-001',
  name: 'Test Item',
  description: 'A test item for unit testing',
  price: 10,
  categoryId: 'category-id',
  isActive: true, // create 时可选，默认为 true
})

describe('Item Entity', () => {
  it('should create an item with valid properties', () => {
    const props = makeValidProps()
    const item = Item.create(props)

    expect(item.code).toBe(props.code)
    expect(item.name).toBe(props.name)
    expect(item.description).toBe(props.description)
    expect(item.price).toBe(props.price)
    expect(item.priceInCents).toBe(1000) // 10.00 -> 1000 cents
    expect(item.categoryId).toBe(props.categoryId)
    expect(item.isActive).toBe(true)
    expect(item.isDeleted()).toBe(false)
    expect(item.isAvailable()).toBe(true)
  })

  it('should restore an item from persisted data', () => {
    const baseProps = makeValidProps()
    const now = new Date()

    const item = Item.restore(
      {
        storeId: baseProps.storeId,
        code: baseProps.code,
        name: baseProps.name,
        description: baseProps.description,
        price: 1000, // cents
        isActive: true,
        categoryId: baseProps.categoryId,
        createdAt: now,
        updatedAt: now,
      },
      'item-1'
    )

    expect(item.code).toBe(baseProps.code)
    expect(item.name).toBe(baseProps.name)
    expect(item.description).toBe(baseProps.description)
    expect(item.price).toBe(10) // 1000 cents -> 10.00 decimal
    expect(item.priceInCents).toBe(1000)
    expect(item.categoryId).toBe(baseProps.categoryId)
    expect(item.isActive).toBe(true)
    expect(item.createdAt).toBe(now)
    expect(item.updatedAt).toBe(now)
    expect(item.isDeleted()).toBe(false)
  })

  it('should deactivate an active item', () => {
    const item = Item.create(makeValidProps())
    item.deactivate()

    expect(item.isActive).toBe(false)
    expect(item.isAvailable()).toBe(false)
  })

  it('should not deactivate an already inactive item', () => {
    const item = Item.create({ ...makeValidProps(), isActive: false })

    expect(() => item.deactivate()).toThrow('Item is already inactive')
  })

  it('should reactivate an inactive item', () => {
    const item = Item.create({ ...makeValidProps(), isActive: false })
    item.reactivate()

    expect(item.isActive).toBe(true)
    expect(item.isAvailable()).toBe(true)
  })

  it('should not reactivate an already active item', () => {
    const item = Item.create(makeValidProps())

    expect(() => item.reactivate()).toThrow('Item is already active')
  })

  it('should soft delete a valid item', () => {
    const item = Item.create(makeValidProps())
    item.softDelete()

    expect(item.deletedAt).not.toBeNull()
    expect(item.isDeleted()).toBe(true)
    expect(item.isAvailable()).toBe(false)
    expect(item.isActive).toBe(false) // 软删除后 isActive getter 返回 false
  })

  it('should not soft delete an already deleted item', () => {
    const item = Item.create(makeValidProps())
    item.softDelete()

    expect(() => item.softDelete()).toThrow('Item already deleted')
  })

  it('should restore a soft-deleted item', () => {
    const item = Item.create(makeValidProps())
    item.softDelete()
    item.restoreDeletion()

    expect(item.deletedAt).toBeNull()
    expect(item.isDeleted()).toBe(false)
    // 恢复删除后，isActive 状态保持不变（这里创建时为 true）
    expect(item.isAvailable()).toBe(true)
  })

  it('should not restore a non-deleted item', () => {
    const item = Item.create(makeValidProps())

    expect(() => item.restoreDeletion()).toThrow('Item is not deleted')
  })

  it('should not allow reactivation of a deleted item', () => {
    const item = Item.create({ ...makeValidProps(), isActive: false })
    item.softDelete()

    expect(() => item.reactivate()).toThrow('Cannot reactivate a deleted item')
  })

  it('should not allow deactivation of a deleted item', () => {
    const item = Item.create(makeValidProps())
    item.softDelete()

    expect(() => item.deactivate()).toThrow('Item is deleted')
  })

  it('should update name, description, price and categoryId', () => {
    const item = Item.create(makeValidProps())

    item.update({
      name: 'Updated Name',
      description: 'Updated Description',
      price: 25.5,
      categoryId: 'new-category-id',
    })

    expect(item.name).toBe('Updated Name')
    expect(item.description).toBe('Updated Description')
    expect(item.price).toBe(25.5)
    expect(item.priceInCents).toBe(2550)
    expect(item.categoryId).toBe('new-category-id')
  })

  it('should not allow update if item is deleted', () => {
    const item = Item.create(makeValidProps())
    item.softDelete()

    expect(() => item.update({ name: 'Updated Name' })).toThrow('Cannot update a deleted item')
  })
})