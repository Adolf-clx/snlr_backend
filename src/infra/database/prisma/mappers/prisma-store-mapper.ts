import { Store } from '@/domain/store/store'
import { Prisma, Store as PrismaStore } from '@prisma/client'

export class PrismaStoreMapper {
  static toDomain(raw: PrismaStore): Store {
    return Store.restore(
      {
        name: raw.name,
        code: raw.code,
        address: raw.address,
        phone: raw.phone,
        longitude: raw.longitude,
        latitude: raw.latitude,
        isOpen: raw.isOpen,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt ?? undefined,
      },
      raw.id
    )
  }

  static toPrisma(store: Store): Prisma.StoreUncheckedCreateInput {
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
