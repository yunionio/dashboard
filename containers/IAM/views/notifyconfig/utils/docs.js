import { getDocsUrl } from '@/utils/utils'

export const getNotifyDocsUrl = (type) => {
  let baseUrl = getDocsUrl() + 'auth_security/notify/tutorial/mailconfig/config'

  switch (type) {
    case 'mobile':
      baseUrl += '/#阿里云获取短信参数步骤'
      break
    case 'dingtalk':
      baseUrl += '/#钉钉平台获取参数步骤'
      break
    case 'feishu':
      baseUrl += '/#飞书平台获取参数步骤'
      break
    case 'workwx':
      baseUrl += '/#企业微信平台获取参数步骤'
      break
    default:
      break
  }

  return baseUrl
}
