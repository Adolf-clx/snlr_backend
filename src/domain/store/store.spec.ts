import { sleep } from 'test/utils/sleep'
import { Store } from './store'

describe('Store Entity', () => {
  it('should create a store with valid properties', async () => {
    const store = Store.create({
      name: 'Test Store',
      code: 'ST001',
      address: 'Test Address',
      phone: '1234567890',
    })
    expect(store.id).toBeDefined()
    expect(store.name).toBe('Test Store')
    expect(store.code).toBe('ST001')
    expect(store.address).toBe('Test Address')
    expect(store.phone).toBe('1234567890')
    expect(store.isOpen).toBe(true)
    expect(store.createdAt).toBeDefined()
    expect(store.updatedAt).toBeDefined()
  })

  it('should update the updatedAt when touching the store', async () => {
    const store = Store.create({
      name: 'Touch Test',
      code: 'ST002',
      address: 'Test Address',
      phone: '1234567890',
    })
    const initialUpdatedAt = store.updatedAt
    await sleep(10)
    store.touch()
    expect(store.updatedAt.getTime()).toBeGreaterThan(initialUpdatedAt.getTime())
  })

  it('should restore a store', async () => {
    const store = Store.restore(
      {
        name: 'Restored Store',
        code: 'ST003',
        address: 'Restored Address',
        phone: '0987654321',
        longitude: 10.5,
        latitude: 20.5,
        isOpen: false,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      },
      '12345'
    )
    expect(store.id).toBe('12345')
    expect(store.name).toBe('Restored Store')
    expect(store.code).toBe('ST003')
    expect(store.longitude).toBe(10.5)
    expect(store.latitude).toBe(20.5)
    expect(store.isOpen).toBe(false)
    expect(store.createdAt).toEqual(new Date('2023-01-01'))
    expect(store.updatedAt).toEqual(new Date('2023-01-02'))
  })

  it('should deactivate an active store', async () => {
    const store = Store.create({
      name: 'Deactivatable',
      code: 'ST004',
      address: 'Test Address',
      phone: '1234567890',
    })
    expect(store.isActive()).toBe(true)
    await sleep(10)
    store.deactivate()
    expect(store.deletedAt).toBeInstanceOf(Date)
    expect(store.isActive()).toBe(false)
  })

  it('should throw if trying to deactivate an already deleted store', () => {
    const store = Store.create({
      name: 'Already Deleted',
      code: 'ST005',
      address: 'Test Address',
      phone: '1234567890',
    })
    store.deactivate()
    expect(() => store.deactivate()).toThrowError('Store already deleted')
  })

  it('should restore a deleted store', async () => {
    const store = Store.create({
      name: 'Reactivatable',
      code: 'ST006',
      address: 'Test Address',
      phone: '1234567890',
    })
    store.deactivate()
    await sleep(10)
    store.restore()
    expect(store.deletedAt).toBeNull()
    expect(store.isActive()).toBe(true)
  })

  it('should throw if trying to restore an active store', () => {
    const store = Store.create({
      name: 'Active Store',
      code: 'ST007',
      address: 'Test Address',
      phone: '1234567890',
    })
    expect(() => store.restore()).toThrowError('Store not deleted')
  })
})
