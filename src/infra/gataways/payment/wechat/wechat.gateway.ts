import { CreatePIXPaymentOutput, CreateWeChatJsapiPaymentOutput, PaymentGateway } from '@/application/payment/gateways/payment-gateway'
import { PaymentStatus } from '@/domain/payment/value-objects/payment-status'
import { EnvService } from '@/infra/env/env.service'
import { Injectable } from '@nestjs/common'
import { WeChatPayService } from './wechat-pay.service'

@Injectable()
export class WeChatGateway implements PaymentGateway {
  constructor(private readonly wechat: WeChatPayService, private readonly env: EnvService) {}

  async createPIXPayment(orderId: string, amount: number): Promise<CreatePIXPaymentOutput> {
    return {
      externalId: `mp_${orderId}`,
      qrCode: '',
      qrCodeBase64: '',
      status: 'pending',
    }
  }

  async getPaymentStatusByExternalId(externalId: string): Promise<PaymentStatus> {
    return PaymentStatus.pending()
  }

  async createWeChatJsapiPayment(orderId: string, amount: number, openId: string): Promise<CreateWeChatJsapiPaymentOutput> {
    const { prepayId, params } = await this.wechat.createJsapi(orderId, `Payment for order ${orderId}`, amount, openId)
    return {
      externalId: prepayId,
      status: 'pending',
      params,
    }
  }
}
