import { Category } from '@/domain/category/category'
import { Injectable } from '@nestjs/common'
import { Span } from 'nestjs-otel'
import { CategoryRepository } from '../repositories/category-repository'

interface CreateCategoryInput {
  storeId: string
  name: string
}

@Injectable()
export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  @Span()
  async execute(input: CreateCategoryInput): Promise<void> {
    const existingCategory = await this.categoryRepository.existsByName(input.name)
    if (existingCategory) throw new Error('Category already exists')
    const category = Category.create(input)
    await this.categoryRepository.save(category)
  }
}
