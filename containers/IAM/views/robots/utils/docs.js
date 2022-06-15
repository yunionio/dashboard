import { getDocsUrl } from '@/utils/utils'

export const getWebhookDocsUrl = (type) => {
  let baseUrl = getDocsUrl() + 'auth_security/notify/tutorial/bot/webhook'

  switch (type) {
    case 'dingtalk':
      baseUrl += '/#钉钉机器人'
      break
    case 'feishu':
      baseUrl += '/#飞书机器人'
      break
    case 'workwx':
      baseUrl += '/#企业微信机器人'
      break
    default:
      break
  }

  return baseUrl
}
