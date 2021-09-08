import { typeClouds } from '@/utils/common/hypervisor'
import { getDocsUrl, isCE } from '@/utils/utils'
import i18n from '@/locales'
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
const ecloudLogo = require('../../../../src/assets/images/providers/ecloud.svg')
const hcsoLogo = require('../../../../src/assets/images/providers/hcso.svg')

function getDocsCloudaccountPath (scope) {
  const docsUrl = getDocsUrl(scope)
  if (isCE()) {
    return `${docsUrl}/howto/multicloud/cloudaccount/`
  }
  return `${docsUrl}/user/multiplecloud/cloudaccount/cloudaccount/`
}

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
    ecloud: {
      name: providerMap.ecloud.label,
      logo: ecloudLogo,
      component: 'EcloudCreate',
      provider: providerMap.ecloud.key,
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
    hcso: {
      name: providerMap.hcso.label,
      logo: hcsoLogo,
      component: 'HCSOCreate',
      provider: providerMap.hcso.key,
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

export function getCloudaccountDocs (scope) {
  const docs_path = getDocsCloudaccountPath(scope)
  return {
    aliyun: i18n.t('cloudenv.text_125', [docs_path]),
    azure: i18n.t('cloudenv.text_126', [docs_path]),
    aws: i18n.t('cloudenv.text_127', [docs_path]),
    qcloud: i18n.t('cloudenv.text_128', [docs_path]),
    huawei: i18n.t('cloudenv.text_129', [docs_path]),
    ucloud: i18n.t('cloudenv.text_130', [docs_path]),
    zstack: i18n.t('cloudenv.text_131', [docs_path]),
    dstack: i18n.t('cloudenv.text_131', [docs_path]),
    openstack: i18n.t('cloudenv.text_132', [docs_path]),
    vmware: i18n.t('cloudenv.text_133', [docs_path]),
    s3: i18n.t('cloudenv.text_134', [docs_path]),
    ceph: i18n.t('cloudenv.text_135', [docs_path]),
    xsky: i18n.t('cloudenv.text_136', [docs_path]),
    google: i18n.t('cloudenv.text_137', [docs_path]),
    ctyun: i18n.t('cloudenv.text_138', [docs_path]),
    apsara: i18n.t('cloudenv.create_apsara_cloud_account', [docs_path]),
    ecloud: i18n.t('cloudenv.create_ecloud', [docs_path]),
    hcso: i18n.t('cloudenv.create_hcso', [docs_path]),
  }
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
  ecloud: {},
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
  hcso: {
    k: 'access_key_id',
    s: 'access_key_secret',
    text: i18n.t('cloudPrvidersMap.HCSO'),
    placeholder: {
      k: i18n.t('cloudenv.text_144'),
      s: i18n.t('cloudenv.text_145'),
    },
    label: {
      k: i18n.t('cloudenv.text_146'),
      s: i18n.t('cloudenv.text_147'),
    },
  },
  ecloud: {
    k: 'access_key_id',
    s: 'access_key_secret',
    text: i18n.t('scopeCloudPrvidersMap.Ecloud'),
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

export function getBillBucketUrlDocs (scope) {
  const docsUrl = getDocsCloudaccountPath(scope)
  return {
    aliyun: i18n.t('cloudenv.text_164', [docsUrl]),
    aws: i18n.t('cloudenv.text_165', [docsUrl]),
    huawei: i18n.t('cloudenv.text_166', [docsUrl]),
    google: i18n.t('cloudenv.text_167', [docsUrl]),
  }
}

export function getSamlUserDocs (scope) {
  const docsUrl = getDocsCloudaccountPath(scope)
  return i18n.t('cloudenv.dentity_provider', [docsUrl])
}

export function getEnrollmentNumberDocs (scope) {
  const docsUrl = getDocsCloudaccountPath(scope)
  return docsUrl + i18n.t('cloudenv.text_219')
}
