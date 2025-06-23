import { genDocsUrl } from '@/utils/utils'
import store from '@/store'

export const getWebhookDocsUrl = (type) => {
  let baseUrl = genDocsUrl({
    scope: store.getters.domain,
    isSysCE: store.getters.isSysCE,
    cePath: 'guides/misc/notify/bot',
    eePath: 'web_ui/iam/notify/bot',
  })

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
