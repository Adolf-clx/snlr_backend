import { Customer } from '@/domain/customer/customer'
import { Prisma, Customer as PrismaCustomer } from '@prisma/client'

export class PrismaCustomerMapper {
  static toDomain(raw: PrismaCustomer): Customer {
    return Customer.restore(
      {
        nickname: raw.nickname ?? '',
        phone: raw.phone ?? '',
        createdAt: raw.createdAt,
      },
      raw.id
    )
  }

  static toPrisma(Customer: Customer): Prisma.CustomerUncheckedCreateInput {
    return {
      id: Customer.id,
      nickname: Customer.nickname,
      phone: Customer.phone,
      openId: undefined,
      unionId: undefined,
      avatarUrl: undefined,
      createdAt: Customer.createdAt,
      updatedAt: new Date(),
    }
  }
}
