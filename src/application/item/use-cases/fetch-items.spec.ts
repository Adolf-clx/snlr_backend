import { makeItem } from 'test/factories/make-item'
import { InMemoryItemRepository } from 'test/repositories/in-memory-item-repository'
import { ItemStatus } from '../@types/fetch-items-search-filters'
import { FetchItemsUseCase } from './fetch-items'

let itemRepository: InMemoryItemRepository
let sut: FetchItemsUseCase

describe('Fetch Items Use Case', () => {
  beforeEach(() => {
    itemRepository = new InMemoryItemRepository()
    sut = new FetchItemsUseCase(itemRepository)
  })

  it('should fetch items filtered by name (partial match)', async () => {
    await itemRepository.save(makeItem({ name: 'Black T-Shirt' }))
    await itemRepository.save(makeItem({ name: 'White T-Shirt' }))
    await itemRepository.save(makeItem({ name: 'Blue Sneakers' }))
    const result = await sut.execute({ name: 't-shirt' })
    expect(result.data).toHaveLength(2)
    expect(result.data.every(i => i.name.toLowerCase().includes('t-shirt'))).toBe(true)
  })

  it('should fetch items filtered by name (partial match)', async () => {
    await itemRepository.save(makeItem({ code: 'cod-1' }))
    await itemRepository.save(makeItem({ code: 'cod-2' }))
    const result = await sut.execute({ code: 'cod-1' })
    expect(result.data).toHaveLength(1)
    expect(result.data[0].code).toBe('cod-1')
  })

  it('should filter items by categoryId', async () => {
    const cat1 = 'cat-1'
    const cat2 = 'cat-2'
    await itemRepository.save(makeItem({ categoryId: cat1 }))
    await itemRepository.save(makeItem({ categoryId: cat2 }))
    await itemRepository.save(makeItem({ categoryId: cat2 }))
    const result = await sut.execute({ categoryId: cat2 })
    expect(result.data).toHaveLength(2)
    expect(result.data.every(i => i.categoryId === cat2)).toBe(true)
  })

  it('should filter by status ACTIVE', async () => {
    await itemRepository.save(makeItem({ isActive: true }))
    await itemRepository.save(makeItem({ isActive: false }))
    await itemRepository.save(makeItem({ isActive: true }))
    const result = await sut.execute({ status: ItemStatus.ACTIVE })
    expect(result.data).toHaveLength(2)
    expect(result.data.every(i => i.isActive)).toBe(true)
  })

  it('should filter by status INACTIVE', async () => {
    await itemRepository.save(makeItem({ isActive: false }))
    await itemRepository.save(makeItem({ isActive: true }))
    await itemRepository.save(makeItem({ isActive: false }))
    const result = await sut.execute({ status: ItemStatus.INACTIVE })
    expect(result.data).toHaveLength(2)
    expect(result.data.every(i => !i.isActive)).toBe(true)
  })

  it('should filter by status DELETED', async () => {
    const deletedItem = makeItem()
    deletedItem.softDelete()
    await itemRepository.save(deletedItem)
    await itemRepository.save(makeItem())
    await itemRepository.save(makeItem())
    const result = await sut.execute({ status: ItemStatus.DELETED })
    expect(result.data).toHaveLength(1)
    expect(result.data[0].id).toBe(deletedItem.id.toString())
  })

  it('should paginate results correctly', async () => {
    for (let i = 0; i < 25; i++) {
      await itemRepository.save(makeItem({ name: `Produto ${String(i).padStart(2, '0')}` }))
    }
    const page1 = await sut.execute({ page: 1, perPage: 10 })
    const page2 = await sut.execute({ page: 2, perPage: 10 })
    const page3 = await sut.execute({ page: 3, perPage: 10 })
    expect(page1.data).toHaveLength(10)
    expect(page2.data).toHaveLength(10)
    expect(page3.data).toHaveLength(5)
  })

  it('should sort items by name (ascending)', async () => {
    await itemRepository.save(makeItem({ name: 'Banana' }))
    await itemRepository.save(makeItem({ name: 'Apple' }))
    await itemRepository.save(makeItem({ name: 'Carrot' }))
    const result = await sut.execute({ sortOrder: 'asc' })
    const names = result.data.map(i => i.name)
    expect(names).toEqual(['Apple', 'Banana', 'Carrot'])
  })

  it('should sort items by name (descending)', async () => {
    await itemRepository.save(makeItem({ name: 'Banana' }))
    await itemRepository.save(makeItem({ name: 'Apple' }))
    await itemRepository.save(makeItem({ name: 'Carrot' }))
    const result = await sut.execute({ sortOrder: 'desc' })
    const names = result.data.map(i => i.name)
    expect(names).toEqual(['Carrot', 'Banana', 'Apple'])
  })

  it('should return correct pagination metadata', async () => {
    for (let i = 0; i < 7; i++) {
      await itemRepository.save(makeItem({ name: `Item ${i}` }))
    }
    const page = 2
    const perPage = 3
    const result = await sut.execute({ page, perPage })
    expect(result.total).toBe(7)
    expect(result.page).toBe(2)
    expect(result.perPage).toBe(3)
    expect(result.totalPages).toBe(3)
    expect(result.data).toHaveLength(3)
  })
})
