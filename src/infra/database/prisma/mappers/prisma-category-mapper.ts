import { Category } from '@/domain/category/category'
import { Prisma, Category as PrismaCategory } from '@prisma/client'

export class PrismaCategoryMapper {
  static toDomain(raw: PrismaCategory): Category {
    return Category.restore(
      {
        storeId: raw.storeId,
        name: raw.name,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt ?? undefined,
      },
      raw.id
    )
  }

  static toPrisma(Category: Category): Prisma.CategoryUncheckedCreateInput {
    return {
      id: Category.id,
      storeId: Category.storeId,
      name: Category.name,
      createdAt: Category.createdAt,
      updatedAt: Category.updatedAt,
      deletedAt: Category.deletedAt,
    }
  }
}
