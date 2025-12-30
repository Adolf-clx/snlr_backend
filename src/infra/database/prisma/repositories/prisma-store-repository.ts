import { StoreStatus, FetchStoresSearchParams } from '@/application/store/@types/fetch-stores-search-filters'
import { StoreRepository } from '@/application/store/repositories/store-repository'
import { Store } from '@/domain/store/store'
import { Injectable } from '@nestjs/common'
import { PrismaStoreMapper } from '../mappers/prisma-store-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaStoreRepository implements StoreRepository {
  constructor(private prisma: PrismaService) {}

  async existsByCode(code: string): Promise<boolean> {
    const store = await this.prisma.store.findUnique({
      where: {
        code,
      },
    })
    return !!store
  }

  async findById(id: string): Promise<Store | null> {
    const store = await this.prisma.store.findUnique({
      where: { id },
    })
    if (!store) return null
    return PrismaStoreMapper.toDomain(store)
  }

  async findMany(params: FetchStoresSearchParams): Promise<Store[]> {
    const status = params.status ?? StoreStatus.ACTIVE
    const sortOrder = params.sortOrder ?? 'asc'
    const where = status === StoreStatus.ALL ? {} : { deletedAt: status === StoreStatus.ACTIVE ? null : { not: null } }
    const stores = await this.prisma.store.findMany({
      where,
      orderBy: { name: sortOrder },
    })
    return stores.map(PrismaStoreMapper.toDomain)
  }

  async save(store: Store): Promise<void> {
    const data = PrismaStoreMapper.toPrisma(store)
    await this.prisma.store.create({
      data,
    })
  }

  async update(store: Store): Promise<void> {
    const data = PrismaStoreMapper.toPrisma(store)
    await this.prisma.store.update({
      where: { id: store.id },
      data,
    })
  }

  async delete(store: Store): Promise<void> {
    const data = PrismaStoreMapper.toPrisma(store)
    await this.prisma.store.update({
      where: { id: store.id },
      data: {
        deletedAt: data.deletedAt,
        updatedAt: data.updatedAt,
      },
    })
  }
}
