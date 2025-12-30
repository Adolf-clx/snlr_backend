import { Payment } from '@/domain/payment/payment'
import {
  Prisma,
  Payment as PrismaPayment,
  PaymentStatus as PrismaPaymentStatus
} from '@prisma/client'

export class PrismaPaymentMapper {
  static toDomain(raw: PrismaPayment): Payment {
    return Payment.restore(
      {
        orderId: raw.orderId,
        status: raw.status as PrismaPaymentStatus,
        amount: raw.amount,
        qrCode: raw.payUrl ?? '',
        externalId: raw.transactionId ?? '',
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id
    )
  }

  static toPrisma(payment: Payment): Prisma.PaymentUncheckedCreateInput {
    return {
      id: payment.id,
      orderId: payment.orderId,
      status: payment.status as PrismaPaymentStatus,
      amount: payment.amountInCents,
      payUrl: payment.qrCode || undefined,
      transactionId: payment.externalId || undefined,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    }
  }
}
