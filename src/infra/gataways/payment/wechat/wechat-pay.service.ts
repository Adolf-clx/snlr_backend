import { EnvService } from '@/infra/env/env.service'
import { Injectable } from '@nestjs/common'
import crypto from 'crypto'

@Injectable()
export class WeChatPayService {
  constructor(private readonly env: EnvService) {}

  async createJsapi(orderId: string, description: string, amount: number, openId: string) {
    const appId = this.env.get('WECHAT_APP_ID')
    const prepayId = `prepay_${orderId}`
    const timeStamp = String(Math.floor(Date.now() / 1000))
    const nonceStr = crypto.randomBytes(16).toString('hex')
    const pkg = `prepay_id=${prepayId}`
    const signType = 'RSA'
    const content = `${appId}\n${timeStamp}\n${nonceStr}\n${pkg}\n`
    const key = this.env.get('WECHAT_PRIVATE_KEY')
    const signer = crypto.createSign('RSA-SHA256')
    signer.update(content)
    const paySign = signer.sign(key, 'base64')
    return {
      prepayId,
      params: {
        timeStamp,
        nonceStr,
        package: pkg,
        signType,
        paySign,
      },
    }
  }
}
