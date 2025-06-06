import { genDocsUrl } from '@/utils/utils'

export const getNotifyDocsUrl = (type) => {
  let baseUrl = genDocsUrl({
    scope: this.$store.getters.domain,
    isSysCE: this.$store.getters.isSysCE,
    cePath: 'guides/misc/notify/mailconfig',
    eePath: 'web_ui/iam/notify/mailconfig',
  })

  switch (type) {
    case 'mobile':
      baseUrl += '/#阿里云获取短信参数步骤'
      break
    case 'mobile_aliyun':
      baseUrl += '/#阿里云获取短信参数步骤'
      break
    case 'mobile_huawei':
      baseUrl += '/#华为云获取短信参数步骤'
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
