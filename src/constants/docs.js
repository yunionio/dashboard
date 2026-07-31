import { genDocsUrl, isCE } from '@/utils/utils'
import i18n from '@/locales'
import store from '@/store'
import setting from '@/config/setting'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'

function getI18n (key, params) {
  const ce = isCE() || store.getters.isSysCE
  // 中文界面：使用当前 locale（zh-CN），保持原有占位参数
  if (setting.language === 'zh-CN' || !ce) {
    return params !== undefined ? i18n.t(key, 'zh-CN', params) : i18n.t(key, 'zh-CN')
  }
  // 其他语言：统一走英文文档
  return params !== undefined ? i18n.t(key, 'en', params) : i18n.t(key, 'en')
}

export const showDocsLink = () => {
  console.log(store.getters.scopedPolicy)
  const ce = isCE() || store.getters.isSysCE
  if (ce) return true
  return !isScopedPolicyMenuHidden('navbar_hidden_items.docs')
}

export const DOCS_MAP = {
  cloudaccount: function () {
    const docsUrl = genDocsUrl({
      scope: store.getters.scope,
      isSysCE: store.getters.isSysCE,
      cePath: 'cmp/guides/cloudaccounts/cloudaccount',
      eePath: 'web_ui/resource-mgmt/multiplecloud/cloudaccount',
    })
    return {
      // public
      aliyun: docsUrl + '/public/aliyun',
      aws: docsUrl + '/public/aws',
      azure: docsUrl + '/public/azure',
      huawei: docsUrl + '/public/huawei',
      qcloud: docsUrl + '/public/qcloud',
      volcengine: docsUrl + '/public/volcengine',
      ucloud: docsUrl + '/public/ucloud',
      google: docsUrl + '/public/google',
      ctyun: docsUrl + '/public/ctyun',
      ecloud: docsUrl + '/public/ecloud',
      jdcloud: docsUrl + '/public/jdcloud',
      baidu: docsUrl + '/public/baidu',
      chinaunion: docsUrl + '/public/cucloud',
      ksyun: docsUrl + '/public/kscloud',
      qingcloud: docsUrl + '/public/qingcloud',
      oraclecloud: docsUrl + '/public/oracle',
      // private
      vmware: docsUrl + '/private/vmware',
      openstack: docsUrl + '/private/openstack',
      zstack: docsUrl + '/private/zstack',
      zettakit: docsUrl + '/private/zettakit',
      apsara: docsUrl + '/private/apsara',
      cloudpods: docsUrl + '/private/cloudpods',
      hcso: docsUrl + '/private/hcso',
      hcs: docsUrl + '/private/hcs',
      nutanix: docsUrl + '/private/nutanix',
      proxmox: docsUrl + '/private/proxmox',
      h3c: docsUrl + '/private/h3c',
      // storage
      s3: docsUrl + '/storage/s3',
      ceph: docsUrl + '/storage/ceph',
      xsky: docsUrl + '/storage/xsky',
      // 不在文档分类图中：仅返回 docsUrl
      rockbase: docsUrl,
      dstack: docsUrl,
      cephfs: docsUrl,
      bingocloud: docsUrl,
      incloudsphere: docsUrl,
      uis: docsUrl,
      cas: docsUrl,
      sangfor: docsUrl,
      cloudflare: docsUrl,
      cnware: docsUrl,
      oceanbase: docsUrl,
    }
  },
  billBucket: function () {
    const docsUrl = genDocsUrl({
      scope: store.getters.scope,
      isSysCE: store.getters.isSysCE,
      cePath: 'cmp/guides/cloudaccounts/cloudaccount',
      eePath: 'web_ui/multiplecloud/cloudaccount/cloudaccount',
    })
    return {
      aliyun: getI18n('cloudenv.text_164', [docsUrl]),
      volcengine: getI18n('cloudenv.bill_bucket_url', [docsUrl, 'url-4']),
      aws: getI18n('cloudenv.text_165', [docsUrl]),
      huawei: getI18n('cloudenv.text_166', [docsUrl]),
      google: getI18n('cloudenv.text_167', [docsUrl]),
      qcloud: getI18n('cloudenv.bill_bucket_url', [docsUrl, 'url-3']),
      ksyun: getI18n('cloudenv.ksyun_bucket_url', [docsUrl]),
    }
  },
  samlUser: function () {
    const docsUrl = genDocsUrl({
      scope: store.getters.scope,
      isSysCE: store.getters.isSysCE,
      cePath: 'cmp/guides/cloudaccounts/cloudaccount',
      eePath: 'web_ui/multiplecloud/cloudaccount/cloudaccount',
    })
    return getI18n('cloudenv.dentity_provider', [docsUrl])
  },
  enrollmentNumber: function () {
    const docsUrl = genDocsUrl({
      scope: store.getters.scope,
      isSysCE: store.getters.isSysCE,
      cePath: 'cmp/guides/cloudaccounts/cloudaccount',
      eePath: 'web_ui/multiplecloud/cloudaccount/cloudaccount',
    })
    return docsUrl + i18n.t('cloudenv.text_219')
  },
  cloudaccountVMwareNet: function () {
    return genDocsUrl({
      scope: store.getters.scope,
      isSysCE: store.getters.isSysCE,
      cePath: 'cmp/guides/cloudaccounts/vmware_net',
      eePath: 'function_principle/multicloud/cloudaccounts/vmware_net',
    })
  },
  pciVendorAndDevice: function () {
    return genDocsUrl({
      scope: store.getters.scope,
      isSysCE: store.getters.isSysCE,
      cePath: 'onpremise/guides/vminstance/passthrough/custom-pci-devices',
      eePath: 'web_ui/computing/resources/gpu/#自定义透传设备类型',
    })
  },
  sshProxy: function () {
    return genDocsUrl({
      scope: store.getters.scope,
      isSysCE: store.getters.isSysCE,
      cePath: 'onpremise/guides/network/ssh/sshproxy',
      eePath: 'web_ui/network/ssh/sshproxy',
    })
  },
  metricDocs: function () {
    return genDocsUrl({
      scope: store.getters.scope,
      isSysCE: store.getters.isSysCE,
      eePath: 'web_ui/intro/dashboard/',
      cePath: 'guides/monitor_ops/metric', // todo: check
      anchor: i18n.t('dashboard.text_184'),
    })
  },
  idpDocs: function () {
    const idpUrl = genDocsUrl({
      scope: store.getters.scope,
      isSysCE: store.getters.isSysCE,
      cePath: 'onpremise/guides/auth_security/identity/providers/',
      eePath: 'web_ui/iam/keystone/ldp',
    })
    return {
      // google_oidc: `${idpUrl}/#${i18n.t('system.google_oidc_doc')}`,
      github_oidc: `${idpUrl}/#${i18n.t('system.github_oidc_doc')}`,
      azure_oidc: `${idpUrl}/#${i18n.t('system.azure_oidc_doc')}`,
      azure_ad_saml: `${idpUrl}/#${i18n.t('system.azure_ad_saml_doc')}`,
      saml: `${idpUrl}/#${i18n.t('system.saml_doc')}`,
      feishu_oauth2: `${idpUrl}/#${i18n.t('system.feishu_oauth2_doc')}`,
      dingtalk_oauth2: `${idpUrl}/#${i18n.t('system.dingtalk_oauth2_doc')}`,
      qywechat_oauth2: `${idpUrl}/#${i18n.t('system.qywechat_oauth2_doc')}`,
    }
  },
  mailConfig: function (type) {
    let baseUrl = genDocsUrl({
      scope: store.getters.domain,
      isSysCE: store.getters.isSysCE,
      cePath: 'onpremise/guides/misc/notify/mailconfig',
      eePath: 'web_ui/iam/notify/mailconfig',
    })

    switch (type) {
      case 'mobile':
        baseUrl += `/#${getI18n('system.steps_to_param_mobile')}`
        break
      case 'mobile_aliyun':
        baseUrl += `/#${getI18n('system.steps_to_param_mobile_aliyun')}`
        break
      case 'mobile_huawei':
        baseUrl += `/#${getI18n('system.steps_to_param_mobile_huawei')}`
        break
      case 'dingtalk':
        baseUrl += `/#${getI18n('system.steps_to_param_dingtalk')}`
        break
      case 'feishu':
        baseUrl += `/#${getI18n('system.steps_to_param_feishu')}`
        break
      case 'workwx':
        baseUrl += `/#${getI18n('system.steps_to_param_mailconfig')}`
        break
      default:
        break
    }

    return baseUrl
  },
  webhook: function (type) {
    let baseUrl = genDocsUrl({
      scope: store.getters.domain,
      isSysCE: store.getters.isSysCE,
      cePath: 'onpremise/guides/misc/notify/bot',
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
  },
  sshProxyVmConfiguration: function (lang) {
    if (lang === 'zh-CN') {
      return genDocsUrl({
        scope: store.getters.domain,
        isSysCE: store.getters.isSysCE,
        cePath: 'onpremise/guides/network/ssh/sshproxy/#虚拟机配置要求',
        eePath: 'web_ui/network/ssh/sshproxy/#虚拟机配置要求',
      })
    } else {
      return genDocsUrl({
        scope: store.getters.domain,
        isSysCE: store.getters.isSysCE,
        cePath: 'onpremise/guides/network/ssh/sshproxy/#server-configuration-requirements',
        eePath: 'web_ui/network/ssh/sshproxy/#虚拟机配置要求',
      })
    }
  },
  blockStorage: function () {
    return genDocsUrl({
      scope: store.getters.scope,
      isSysCE: store.getters.isSysCE,
      cePath: 'onpremise/guides/storage/blockstorage/add-storage',
      eePath: 'web_ui/storage/block/',
    })
  },
  notifyTopic: function () {
    return genDocsUrl({
      scope: store.getters.scope,
      isSysCE: store.getters.isSysCE,
      cePath: 'onpremise/guides/misc/notify/notify-topic',
      eePath: 'web_ui/iam/notify/notify-topic',
    })
  },
  introduction: function () {
    return genDocsUrl({
      scope: store.getters.scope,
      isSysCE: store.getters.isSysCE,
      cePath: 'onpremise/introduction/',
      eePath: '',
      anchor: '',
    })
  },
  schedtag: function () {
    return genDocsUrl({
      scope: store.getters.scope,
      isSysCE: store.getters.isSysCE,
      cePath: 'onpremise/guides/scheduler/schedtags',
      eePath: 'web_ui/computing/schedule/schedtag',
    })
  },
  cluster: function () {
    return {
      kvm: genDocsUrl({
        scope: store.getters.scope,
        isSysCE: store.getters.isSysCE,
        cePath: 'onpremise/guides/k8s/onprimise-pre-env',
        eePath: 'function_principle/k8s/pre_env/',
      }),
    }
  },
  license: function () {
    return genDocsUrl({
      scope: store.getters.scope,
      isSysCE: store.getters.isSysCE,
      cePath: '',
      eePath: 'quickuse/quickstart/licenses/',
    })
  },
  qga: function () {
    return genDocsUrl({
      scope: store.getters.scope,
      isSysCE: store.getters.isSysCE,
      cePath: 'onpremise/guides/vminstance/qga',
      eePath: 'function_principle/onpremise/vminstance/qga/',
    })
  },
}
