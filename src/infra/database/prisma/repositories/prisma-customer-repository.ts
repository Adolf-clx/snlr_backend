import { FetchCustomersSearchParams } from '@/application/customer/@types/fetch-custormers-search-filters'
import { CustomerRepository } from '@/application/customer/repositories/customer-repository'
import { Customer } from '@/domain/customer/customer'
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaCustomerMapper } from '../mappers/prisma-customer-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private prisma: PrismaService) {}

  private buildSearchWhere(params: FetchCustomersSearchParams): Prisma.CustomerWhereInput {
    const { nickname, phone } = params
    const where: Prisma.CustomerWhereInput = {}
    if (nickname) where.nickname = { contains: nickname, mode: 'insensitive' }
    if (phone) where.phone = phone
    return where
  }

  async existsByPhone(phone: string): Promise<boolean> {
    const customer = await this.prisma.customer.findUnique({
      where: {
        phone,
      },
    })
    return !!customer
  }

  async findMany(params: FetchCustomersSearchParams): Promise<Customer[]> {
    const { page = 1, perPage = 10, sortOrder = 'asc' } = params
    const skip = (page - 1) * perPage
    const take = perPage
    const where = this.buildSearchWhere(params)
    const rawCustomers = await this.prisma.customer.findMany({
      where,
      orderBy: { createdAt: sortOrder },
      skip,
      take,
    })
    return rawCustomers.map(PrismaCustomerMapper.toDomain)
  }

  async findById(id: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    })
    if (!customer) return null
    return PrismaCustomerMapper.toDomain(customer)
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { phone },
    })
    if (!customer) return null
    return PrismaCustomerMapper.toDomain(customer)
  }

  async save(customer: Customer): Promise<void> {
    const data = PrismaCustomerMapper.toPrisma(customer)
    await this.prisma.customer.create({
      data,
    })
  }

  async count(params: FetchCustomersSearchParams): Promise<number> {
    const where: Prisma.CustomerWhereInput = this.buildSearchWhere(params)
    return this.prisma.customer.count({ where })
  }
}
