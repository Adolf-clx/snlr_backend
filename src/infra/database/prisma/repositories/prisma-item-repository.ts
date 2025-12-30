import { FetchItemsSearchParams, ItemStatus } from '@/application/item/@types/fetch-items-search-filters'
import { ItemRepository } from '@/application/item/repositories/item-repository'
import { Item } from '@/domain/item/item'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaItemMapper } from '../mappers/prisma-item-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaItemRepository implements ItemRepository {
  constructor(private prisma: PrismaService) {}

  private buildSearchWhere(params: FetchItemsSearchParams): Prisma.ItemWhereInput {
    const { code, name, categoryId, status } = params
    const where: Prisma.ItemWhereInput = {}
    if (code) where.code = code
    if (name) where.name = { contains: name, mode: 'insensitive' }
    if (categoryId) where.categoryId = categoryId
    if (status === ItemStatus.ACTIVE) {
      where.isActive = true
      where.deletedAt = null
    }
    if (status === ItemStatus.INACTIVE) {
      where.isActive = false
      where.deletedAt = null
    }
    if (status === ItemStatus.DELETED) where.deletedAt = { not: null }
    return where
  }

  async existsByCode(code: string): Promise<boolean> {
    const item = await this.prisma.item.findUnique({
      where: {
        code,
      },
    })
    return !!item
  }

  async findById(id: string): Promise<Item | null> {
    const item = await this.prisma.item.findUnique({
      where: { id },
    })
    if (!item) return null
    return PrismaItemMapper.toDomain(item)
  }

  async findMany(params: FetchItemsSearchParams): Promise<Item[]> {
    const { page = 1, perPage = 10, sortOrder = 'asc' } = params
    const skip = (page - 1) * perPage
    const take = perPage
    const where = this.buildSearchWhere(params)
    const rawItems = await this.prisma.item.findMany({
      where,
      orderBy: { name: sortOrder },
      skip,
      take,
    })
    return rawItems.map(PrismaItemMapper.toDomain)
  }

  async save(item: Item): Promise<void> {
    const data = PrismaItemMapper.toPrisma(item)
    await this.prisma.item.create({
      data,
    })
  }

  async update(item: Item): Promise<void> {
    const data = PrismaItemMapper.toPrisma(item)
    await this.prisma.item.update({
      where: { id: item.id },
      data,
    })
  }

  async delete(item: Item): Promise<void> {
    const data = PrismaItemMapper.toPrisma(item)
    await this.prisma.item.update({
      where: { id: item.id },
      data: {
        deletedAt: data.deletedAt,
        updatedAt: data.updatedAt,
      },
    })
  }

  async count(params: FetchItemsSearchParams): Promise<number> {
    const where: Prisma.ItemWhereInput = this.buildSearchWhere(params)
    return this.prisma.item.count({ where })
  }
}
