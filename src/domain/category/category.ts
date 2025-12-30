import { Entity } from '@/shared/kernel/entities/entity'
import { UniqueEntityID } from '@/shared/kernel/value-objects/unique-entity-id'
import { CategoryName } from './value-objects/category-name'

export interface CategoryProps {
  storeId: string
  name: CategoryName
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface CreateCategoryProps {
  storeId: string
  name: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}

interface RestoreCategoryProps {
  storeId: string
  name: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
}

export class Category extends Entity<CategoryProps> {
  get storeId(): string {
    return this.props.storeId
  }

  get name(): string {
    return this.props.name.value
  }

  set name(name: string) {
    this.props.name = CategoryName.create(name)
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt
  }

  touch(): void {
    this.props.updatedAt = new Date()
  }

  isActive(): boolean {
    return this.deletedAt === null
  }

  deactivate() {
    if (this.deletedAt) throw new Error('Category already deleted')
    this.props.deletedAt = new Date()
    this.touch()
  }

  restore() {
    if (!this.deletedAt) throw new Error('Category not deleted')
    this.props.deletedAt = null
    this.touch()
  }

  static create(props: CreateCategoryProps, id?: string): Category {
    return new Category(
      {
        storeId: props.storeId,
        name: CategoryName.create(props.name),
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
      },
      UniqueEntityID.create(id)
    )
  }

  static restore(props: RestoreCategoryProps, id: string): Category {
    return new Category(
      {
        storeId: props.storeId,
        name: CategoryName.restore(props.name),
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
        deletedAt: props.deletedAt ?? null,
      },
      UniqueEntityID.restore(id)
    )
  }
}
