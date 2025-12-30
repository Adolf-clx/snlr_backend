import { Item } from '@/domain/item/item'

export class ItemPresenter {
  static toHTTP(item: Item) {
    return {
      id: item.id,
      code: item.code,
      name: item.name,
      description: item.description,
      price: item.price,
      categoryId: item.categoryId,
      isActive: item.isActive,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      deletedAt: item.deletedAt,
    }
  }
}
