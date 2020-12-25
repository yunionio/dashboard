import { typeClouds } from '@/utils/common/hypervisor'
import { language } from '@/utils/utils'
import i18n from '@/locales'
const DOCS_PATH = `${window.location.origin}/docs/${language}/docs/user/multiplecloud/cloudaccount/cloudaccount/`
const providerMap = typeClouds.getProviderlowcase()
const aliyunLogo = require('../../../../src/assets/images/providers/aliyun.svg')
const awsLogo = require('../../../../src/assets/images/providers/aws.svg')
const azureLogo = require('../../../../src/assets/images/providers/azure.svg')
const huaweiLogo = require('../../../../src/assets/images/providers/huawei.svg')
const qcloudLogo = require('../../../../src/assets/images/providers/qcloud.svg')
const ucloudLogo = require('../../../../src/assets/images/providers/ucloud.svg')
const vmwareLogo = require('../../../../src/assets/images/providers/vmware.svg')
const openstackLogo = require('../../../../src/assets/images/providers/openstack.svg')
const dstackLogo = require('../../../../src/assets/images/providers/dstack.svg')
const zstackLogo = require('../../../../src/assets/images/providers/zstack.svg')
const s3Logo = require('../../../../src/assets/images/providers/s3.svg')
const cephLogo = require('../../../../src/assets/images/providers/ceph.svg')
const xskyLogo = require('../../../../src/assets/images/providers/xsky.svg')
const googleLogo = require('../../../../src/assets/images/providers/gcp.svg')
const ctyunLogo = require('../../../../src/assets/images/providers/tianyi.svg')
const apsaraLogo = require('../../../../src/assets/images/providers/apsara.svg')

export const CLOUDACCOUNT_TYPES = {
  public: {
    aliyun: {
      name: providerMap.aliyun.label,
      logo: aliyunLogo,
      component: 'AliyunCreate',
      provider: providerMap.aliyun.key,
    },
    aws: {
      name: providerMap.aws.label,
      logo: awsLogo,
      component: 'AwsCreate',
      provider: providerMap.aws.key,
    },
    azure: {
      name: providerMap.azure.label,
      logo: azureLogo,
      component: 'AzureCreate',
      provider: providerMap.azure.key,
    },
    huawei: {
      name: providerMap.huawei.label,
      logo: huaweiLogo,
      component: 'HuaweiCreate',
      provider: providerMap.huawei.key,
    },
    qcloud: {
      name: providerMap.qcloud.label,
      logo: qcloudLogo,
      component: 'QcloudCreate',
      provider: providerMap.qcloud.key,
    },
    ucloud: {
      name: providerMap.ucloud.label,
      logo: ucloudLogo,
      component: 'UcloudCreate',
      provider: providerMap.ucloud.key,
    },
    google: {
      name: providerMap.google.label,
      logo: googleLogo,
      component: 'GoogleCreate',
      provider: providerMap.google.key,
    },
    ctyun: {
      name: providerMap.ctyun.label,
      logo: ctyunLogo,
      component: 'CtyunCreate',
      provider: providerMap.ctyun.key,
    },
  },
  private: {
    vmware: {
      name: providerMap.vmware.label,
      logo: vmwareLogo,
      component: 'VMwareCreate',
      provider: providerMap.vmware.key,
    },
    openstack: {
      name: providerMap.openstack.label,
      logo: openstackLogo,
      component: 'OpenstackCreate',
      provider: providerMap.openstack.key,
    },
    dstack: {
      name: providerMap.dstack.label,
      logo: dstackLogo,
      component: 'DstackCreate',
      provider: providerMap.dstack.key,
    },
    zstack: {
      name: providerMap.zstack.label,
      logo: zstackLogo,
      component: 'ZstackCreate',
      provider: providerMap.zstack.key,
    },
    apsara: {
      name: providerMap.apsara.label,
      logo: apsaraLogo,
      component: 'ApsaraCreate',
      provider: providerMap.apsara.key,
    },
  },
  storage: {
    s3: {
      name: providerMap.s3.label,
      logo: s3Logo,
      component: 'S3Create',
      provider: providerMap.s3.key,
    },
    ceph: {
      name: providerMap.ceph.label,
      logo: cephLogo,
      component: 'CephCreate',
      provider: providerMap.ceph.key,
    },
    xsky: {
      name: providerMap.xsky.label,
      logo: xskyLogo,
      component: 'XskyCreate',
      provider: providerMap.xsky.key,
      hiddenName: true,
    },
  },
}

export const ENV_TITLE = {
  public: i18n.t('cloudenv.text_122'),
  storage: i18n.t('cloudenv.text_123'),
  private: i18n.t('cloudenv.text_124'),
}

export const CLOUDACCOUNT_DOCS = {
  aliyun: i18n.t('cloudenv.text_125', [DOCS_PATH]),
  azure: i18n.t('cloudenv.text_126', [DOCS_PATH]),
  aws: i18n.t('cloudenv.text_127', [DOCS_PATH]),
  qcloud: i18n.t('cloudenv.text_128', [DOCS_PATH]),
  huawei: i18n.t('cloudenv.text_129', [DOCS_PATH]),
  ucloud: i18n.t('cloudenv.text_130', [DOCS_PATH]),
  zstack: i18n.t('cloudenv.text_131', [DOCS_PATH]),
  dstack: i18n.t('cloudenv.text_131', [DOCS_PATH]),
  openstack: i18n.t('cloudenv.text_132', [DOCS_PATH]),
  vmware: i18n.t('cloudenv.text_133', [DOCS_PATH]),
  s3: i18n.t('cloudenv.text_134', [DOCS_PATH]),
  ceph: i18n.t('cloudenv.text_135', [DOCS_PATH]),
  xsky: i18n.t('cloudenv.text_136', [DOCS_PATH]),
  google: i18n.t('cloudenv.text_137', [DOCS_PATH]),
  ctyun: i18n.t('cloudenv.text_138', [DOCS_PATH]),
  apsara: i18n.t('cloudenv.create_apsara_cloud_account', [DOCS_PATH]),
}

export const ACCESS_URL = {
  huawei: {
    InternationalCloud: i18n.t('cloudenv.text_139'),
    ChinaCloud: i18n.t('cloudenv.text_140'),
  },
  aws: {
    InternationalCloud: i18n.t('cloudenv.text_139'),
    ChinaCloud: i18n.t('cloudenv.text_140'),
  },
  azure: {
    AzureChinaCloud: i18n.t('cloudenv.text_140'),
    AzurePublicCloud: i18n.t('cloudenv.text_139'),
    AzureUSGovernmentCloud: i18n.t('cloudenv.text_141'),
    AzureGermanCloud: i18n.t('cloudenv.text_142'),
  },
  ctyun: {
    InternationalCloud: i18n.t('cloudenv.text_139'),
    ChinaCloud: i18n.t('cloudenv.text_140'),
  },
  aliyun: {
    InternationalCloud: i18n.t('cloudenv.international_cloud'),
    FinanceCloud: i18n.t('cloudenv.finance_cloud'),
  },
  ucloud: {},
}

export const keySecretFields = {
  aliyun: {
    k: 'access_key_id',
    s: 'access_key_secret',
    text: i18n.t('cloudenv.text_143'),
    placeholder: {
      k: i18n.t('cloudenv.text_144'),
      s: i18n.t('cloudenv.text_145'),
    },
    label: {
      k: i18n.t('cloudenv.text_146'),
      s: i18n.t('cloudenv.text_147'),
    },
  },
  qcloud: {
    k: 'secret_id',
    s: 'secret_key',
    text: i18n.t('cloudenv.text_148'),
    placeholder: {
      k: i18n.t('cloudenv.text_149'),
      s: i18n.t('cloudenv.text_150'),
    },
    label: {
      k: i18n.t('cloudenv.text_146'),
      s: i18n.t('cloudenv.text_147'),
    },
  },
  openstack: {
    k: 'username',
    s: 'password',
    text: 'OpenStack',
    placeholder: {
      k: i18n.t('cloudenv.text_151'),
      s: i18n.t('cloudenv.text_150'),
    },
    label: {
      k: i18n.t('cloudenv.text_94'),
      s: i18n.t('cloudenv.text_147'),
    },
  },
  vmware: {
    k: 'username',
    s: 'password',
    text: 'VMware',
    placeholder: {
      k: i18n.t('cloudenv.text_151'),
      s: i18n.t('cloudenv.text_150'),
    },
    label: {
      k: i18n.t('cloudenv.text_94'),
      s: i18n.t('cloudenv.text_147'),
    },
  },
  azure: {
    k: 'client_id',
    s: 'client_secret',
    text: 'Azure',
    placeholder: {
      k: i18n.t('cloudenv.text_152'),
      s: i18n.t('cloudenv.text_153'),
    },
    label: {
      k: i18n.t('cloudenv.text_154'),
      s: i18n.t('cloudenv.text_155'),
    },
  },
  huawei: {
    k: 'access_key_id',
    s: 'access_key_secret',
    text: i18n.t('cloudenv.text_156'),
    placeholder: {
      k: i18n.t('cloudenv.text_144'),
      s: i18n.t('cloudenv.text_145'),
    },
    label: {
      k: i18n.t('cloudenv.text_146'),
      s: i18n.t('cloudenv.text_147'),
    },
  },
  aws: {
    k: 'access_key_id',
    s: 'access_key_secret',
    text: 'AWS',
    placeholder: {
      k: i18n.t('cloudenv.text_144'),
      s: i18n.t('cloudenv.text_145'),
    },
    label: {
      k: i18n.t('cloudenv.text_146'),
      s: i18n.t('cloudenv.text_147'),
    },
  },
  ucloud: {
    k: 'access_key_id',
    s: 'access_key_secret',
    text: 'UCloud',
    placeholder: {
      k: i18n.t('cloudenv.text_157'),
      s: i18n.t('cloudenv.text_158'),
    },
    label: {
      k: i18n.t('cloudenv.text_159'),
      s: i18n.t('cloudenv.text_160'),
    },
  },
  dstack: {
    k: 'username',
    s: 'password',
    text: 'DStack',
    placeholder: {
      k: i18n.t('cloudenv.text_144'),
      s: i18n.t('cloudenv.text_145'),
    },
    label: {
      k: i18n.t('cloudenv.text_146'),
      s: i18n.t('cloudenv.text_147'),
    },
  },
  zstack: {
    k: 'username',
    s: 'password',
    text: 'ZStack',
    placeholder: {
      k: i18n.t('cloudenv.text_144'),
      s: i18n.t('cloudenv.text_145'),
    },
    label: {
      k: i18n.t('cloudenv.text_146'),
      s: i18n.t('cloudenv.text_147'),
    },
  },
  s3: {
    k: 'access_key_id',
    s: 'access_key_secret',
    text: 'S3',
    placeholder: {
      k: i18n.t('cloudenv.text_144'),
      s: i18n.t('cloudenv.text_145'),
    },
    label: {
      k: i18n.t('cloudenv.text_146'),
      s: i18n.t('cloudenv.text_147'),
    },
  },
  ceph: {
    k: 'access_key_id',
    s: 'access_key_secret',
    text: 'Ceph',
    placeholder: {
      k: i18n.t('cloudenv.text_144'),
      s: i18n.t('cloudenv.text_145'),
    },
    label: {
      k: i18n.t('cloudenv.text_146'),
      s: i18n.t('cloudenv.text_147'),
    },
  },
  xsky: {
    k: 'access_key_id',
    s: 'access_key_secret',
    text: 'XSKY',
    placeholder: {
      k: i18n.t('cloudenv.text_151'),
      s: i18n.t('cloudenv.text_150'),
    },
    label: {
      k: i18n.t('cloudenv.text_94'),
      s: i18n.t('cloudenv.text_147'),
    },
  },
  google: {
    s: 'gcp_private_key',
    k: 'gcp_private_key_id',
    text: 'Google',
    placeholder: {
      s: i18n.t('cloudenv.text_161'),
      k: i18n.t('cloudenv.text_162'),
    },
    label: {
      s: 'private_key',
      k: 'private_key_id',
    },
  },
  ctyun: {
    k: 'access_key_id',
    s: 'access_key_secret',
    text: i18n.t('cloudenv.text_163'),
    placeholder: {
      k: i18n.t('cloudenv.text_144'),
      s: i18n.t('cloudenv.text_145'),
    },
    label: {
      k: i18n.t('cloudenv.text_146'),
      s: i18n.t('cloudenv.text_147'),
    },
  },
  apsara: {
    k: 'access_key_id',
    s: 'access_key_secret',
    text: i18n.t('cloudPrvidersMap.Apsara'),
    placeholder: {
      k: i18n.t('cloudenv.text_144'),
      s: i18n.t('cloudenv.text_145'),
    },
    label: {
      k: i18n.t('cloudenv.text_146'),
      s: i18n.t('cloudenv.text_147'),
    },
  },
}

export const BILL_BUCKET_URL_DOCS = {
  aliyun: i18n.t('cloudenv.text_164', [DOCS_PATH]),
  aws: i18n.t('cloudenv.text_165', [DOCS_PATH]),
  huawei: i18n.t('cloudenv.text_166', [DOCS_PATH]),
  google: i18n.t('cloudenv.text_167', [DOCS_PATH]),
}

export const SAML_USER_DOCS = i18n.t('cloudenv.dentity_provider', [DOCS_PATH])
