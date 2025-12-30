import { Store } from '@/domain/store/store'

export class StorePresenter {
  static toHTTP(store: Store) {
    return {
      id: store.id,
      name: store.name,
      code: store.code,
      address: store.address,
      phone: store.phone,
      longitude: store.longitude,
      latitude: store.latitude,
      isOpen: store.isOpen,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
      deletedAt: store.deletedAt,
    }
  }
}
