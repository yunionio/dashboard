import { genDocsUrl } from '@/utils/utils'
import i18n from '@/locales'
import store from '@/store'
import setting from '@/config/setting'

function getI18n (key, params) {
  // 中文界面：使用当前 locale（zh-CN），保持原有占位参数
  if (setting.language === 'zh-CN') {
    return params !== undefined ? i18n.t(key, params) : i18n.t(key)
  }
  // 其他语言：统一走英文文档
  return params !== undefined ? i18n.t(key, 'en', params) : i18n.t(key, 'en')
}

export const DOCS_MAP = {
  cloudaccount: function () {
    const docsUrl = genDocsUrl({
      scope: store.getters.scope,
      isSysCE: store.getters.isSysCE,
      cePath: 'cmp/guides/cloudaccounts/cloudaccount',
      eePath: 'web_ui/multiplecloud/cloudaccount/cloudaccount',
    })
    return {
      aliyun: getI18n('cloudenv.text_125', [docsUrl]),
      azure: getI18n('cloudenv.text_126', [docsUrl]),
      aws: getI18n('cloudenv.text_127', [docsUrl]),
      qcloud: getI18n('cloudenv.text_128', [docsUrl]),
      huawei: getI18n('cloudenv.text_129', [docsUrl]),
      ucloud: getI18n('cloudenv.text_130', [docsUrl]),
      zstack: getI18n('cloudenv.text_131', [docsUrl]),
      dstack: getI18n('cloudenv.text_131', [docsUrl]),
      openstack: getI18n('cloudenv.text_132', [docsUrl]),
      vmware: getI18n('cloudenv.text_133', [docsUrl]),
      s3: getI18n('cloudenv.text_134', [docsUrl]),
      ceph: getI18n('cloudenv.text_135', [docsUrl]),
      cephfs: getI18n('cloudenv.text_135', [docsUrl]),
      xsky: getI18n('cloudenv.text_136', [docsUrl]),
      google: getI18n('cloudenv.text_137', [docsUrl]),
      ctyun: getI18n('cloudenv.text_138', [docsUrl]),
      apsara: getI18n('cloudenv.create_apsara_cloud_account', [docsUrl]),
      ecloud: getI18n('cloudenv.create_ecloud', [docsUrl]),
      jdcloud: getI18n('cloudenv.create_jdcloud', [docsUrl]),
      cloudpods: getI18n('cloudenv.create_cloudpods', [docsUrl]),
      hcso: getI18n('cloudenv.create_hcso', [docsUrl]),
      hcs: getI18n('cloudenv.create_hcs', [docsUrl]),
      nutanix: getI18n('cloudenv.create_nutanix', [docsUrl]),
      bingocloud: getI18n('cloudenv.create_bingocloud', [docsUrl]),
      incloudsphere: getI18n('cloudenv.create_incloudsphere', [docsUrl]),
      proxmox: getI18n('cloudenv.create_proxmox', [docsUrl]),
      h3c: getI18n('cloudenv.create_h3c', [docsUrl]),
      zettakit: getI18n('cloudenv.create_zettakit', [docsUrl]),
      uis: getI18n('cloudenv.create_uis', [docsUrl]),
      ksyun: getI18n('cloudenv.create_ksyun', [docsUrl]),
      baidu: getI18n('cloudenv.create_baidu', [docsUrl]),
      qingcloud: getI18n('cloudenv.create_qingcloud', [docsUrl]),
      chinaunion: getI18n('cloudenv.create_chinaunion', [docsUrl]),
      volcengine: getI18n('cloudenv.create_volcengine', [docsUrl]),
      oraclecloud: getI18n('cloudenv.create_oraclecloud', [docsUrl]),
      sangfor: getI18n('cloudenv.create_sangfor', [docsUrl]),
      cloudflare: getI18n('cloudenv.create_cloudflare', [docsUrl]),
      cnware: getI18n('cloudenv.create_cnware', [docsUrl]),
      oceanbase: getI18n('cloudenv.create_oceanbase', [docsUrl]),
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
        eePath: 'web_ui/network/ssh/sshproxy/#server-configuration-requirements',
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
