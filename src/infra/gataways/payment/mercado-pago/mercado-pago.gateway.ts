import { CreatePIXPaymentOutput, CreateWeChatJsapiPaymentOutput, PaymentGateway } from '@/application/payment/gateways/payment-gateway'
import { PaymentStatus } from '@/domain/payment/value-objects/payment-status'
import { EnvService } from '@/infra/env/env.service'
import { Injectable } from '@nestjs/common'
import { MercadoPagoService } from './mercado-pago.service'

@Injectable()
export class MercadoPagoGateway implements PaymentGateway {
  constructor(
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly envService: EnvService
  ) {}

  async createPIXPayment(orderId: string, amount: number): Promise<CreatePIXPaymentOutput> {
    const now = new Date()
    const TEN_MINUTES = 10 * 60 * 1000
    const qrCodeDateOfExpiration = new Date(now.getTime() + TEN_MINUTES).toISOString()

    const response = await this.mercadoPagoService.payment().create({
      requestOptions: { idempotencyKey: orderId },
      body: {
        payment_method_id: 'pix',
        description: `Payment for the order '${orderId}'`,
        transaction_amount: amount * 100,
        notification_url: this.envService.get('MERCADO_PAGO_WEBHOOK_URL'),
        external_reference: orderId,
        date_of_expiration: qrCodeDateOfExpiration,
      },
    })

    const transaction = response.point_of_interaction?.transaction_data
    if (!transaction?.qr_code || !transaction.qr_code_base64) throw new Error('QR Code data not found in Mercado Pago response')
    if (!response.status) throw new Error('Payment status not found in Mercado Pago response')

    return {
      qrCode: transaction.qr_code,
      qrCodeBase64: transaction.qr_code_base64,
      externalId: String(response.id),
      status: response.status,
    }
  }

  async getPaymentStatusByExternalId(externalId: string): Promise<PaymentStatus> {
    const response = await this.mercadoPagoService.payment().get({ id: externalId })
    if (!response.status) throw new Error(`MercadoPago Payment not found with externalId: ${externalId}`)
    const status = this.mapEventToStatus(response.status)
    if (!status) throw new Error(`Unhandled MercadoPago event: ${response.status}`)
    return status
  }

  async createWeChatJsapiPayment(orderId: string, amount: number, openId: string): Promise<CreateWeChatJsapiPaymentOutput> {
    return {
      externalId: `mp_${orderId}`,
      status: 'pending',
      params: {
        timeStamp: String(Math.floor(Date.now() / 1000)),
        nonceStr: 'nonce',
        package: `prepay_id_${orderId}`,
        signType: 'RSA',
        paySign: 'sign',
      },
    }
  }

  private mapEventToStatus(event: string): PaymentStatus | null {
    const eventStatusMap = new Map<string, () => PaymentStatus>([
      ['created', PaymentStatus.pending],
      ['pending', PaymentStatus.pending],
      ['updated', PaymentStatus.pending],
      ['in_process', PaymentStatus.pending],
      ['authorized', PaymentStatus.approved],
      ['approved', PaymentStatus.approved],
      ['refunded', PaymentStatus.refunded],
      ['cancelled', PaymentStatus.failed],
      ['rejected', PaymentStatus.failed],
    ])
    const factory = eventStatusMap.get(event.toLowerCase())
    return factory ? factory() : null
  }
}
