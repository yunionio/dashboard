import { typeClouds } from '@/utils/common/hypervisor'

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

export const CLOUDACCOUNT_TYPES = {
  public: {
    'aliyun': {
      name: providerMap.aliyun.label,
      logo: aliyunLogo,
      component: 'AliyunCreate',
      provider: providerMap.aliyun.key,
    },
    'aws': {
      name: providerMap.aws.label,
      logo: awsLogo,
      component: 'AwsCreate',
      provider: providerMap.aws.key,
    },
    'azure': {
      name: providerMap.azure.label,
      logo: azureLogo,
      component: 'AzureCreate',
      provider: providerMap.azure.key,
    },
    'huawei': {
      name: providerMap.huawei.label,
      logo: huaweiLogo,
      component: 'HuaweiCreate',
      provider: providerMap.huawei.key,
    },
    'qcloud': {
      name: providerMap.qcloud.label,
      logo: qcloudLogo,
      component: 'QcloudCreate',
      provider: providerMap.qcloud.key,
    },
    'ucloud': {
      name: providerMap.ucloud.label,
      logo: ucloudLogo,
      component: 'UcloudCreate',
      provider: providerMap.ucloud.key,
    },
    'google': {
      name: providerMap.google.label,
      logo: googleLogo,
      component: 'GoogleCreate',
      provider: providerMap.google.key,
    },
    'ctyun': {
      name: providerMap.ctyun.label,
      logo: ctyunLogo,
      component: 'CtyunCreate',
      provider: providerMap.ctyun.key,
    },
  },
  private: {
    'vmware': {
      name: providerMap.vmware.label,
      logo: vmwareLogo,
      component: 'VMwareCreate',
      provider: providerMap.vmware.key,
    },
    'openstack': {
      name: providerMap.openstack.label,
      logo: openstackLogo,
      component: 'OpenstackCreate',
      provider: providerMap.openstack.key,
    },
    'dstack': {
      name: providerMap.dstack.label,
      logo: dstackLogo,
      component: 'DstackCreate',
      provider: providerMap.dstack.key,
    },
    'zstack': {
      name: providerMap.zstack.label,
      logo: zstackLogo,
      component: 'ZstackCreate',
      provider: providerMap.zstack.key,
    },
  },
  storage: {
    's3': {
      name: providerMap.s3.label,
      logo: s3Logo,
      component: 'S3Create',
      provider: providerMap.s3.key,
    },
    'ceph': {
      name: providerMap.ceph.label,
      logo: cephLogo,
      component: 'CephCreate',
      provider: providerMap.ceph.key,
    },
    'xsky': {
      name: providerMap.xsky.label,
      logo: xskyLogo,
      component: 'XskyCreate',
      provider: providerMap.xsky.key,
      hiddenName: true,
    },
  },
}

export const ENV_TITLE = {
  'public': '公有云',
  'storage': '对象存储',
  'private': '私有云 & 虚拟化平台',
}

export const CLOUDACCOUNT_DOCS = {
  aliyun: 'https://onecloud-docs.com/docs/user/multiplecloud/cloudaccount/#%E6%96%B0%E5%BB%BA%E9%98%BF%E9%87%8C%E4%BA%91%E8%B4%A6%E5%8F%B7',
  azure: 'https://onecloud-docs.com/docs/user/multiplecloud/cloudaccount/#%E6%96%B0%E5%BB%BAazure%E8%B4%A6%E5%8F%B7',
  aws: 'https://onecloud-docs.com/docs/user/multiplecloud/cloudaccount/#%E6%96%B0%E5%BB%BAaws%E8%B4%A6%E5%8F%B7',
  qcloud: 'https://onecloud-docs.com/docs/user/multiplecloud/cloudaccount/#%E6%96%B0%E5%BB%BA%E8%85%BE%E8%AE%AF%E4%BA%91%E8%B4%A6%E5%8F%B7',
  huawei: 'https://onecloud-docs.com/docs/user/multiplecloud/cloudaccount/#%E6%96%B0%E5%BB%BA%E5%8D%8E%E4%B8%BA%E4%BA%91%E8%B4%A6%E5%8F%B7',
  ucloud: 'https://onecloud-docs.com/docs/user/multiplecloud/cloudaccount/#%E6%96%B0%E5%BB%BAucloud%E8%B4%A6%E5%8F%B7',
  zstack: 'https://onecloud-docs.com/docs/user/multiplecloud/cloudaccount/#%E6%96%B0%E5%BB%BAzstack-dstack%E8%B4%A6%E5%8F%B7',
  dstack: 'https://onecloud-docs.com/docs/user/multiplecloud/cloudaccount/#%E6%96%B0%E5%BB%BAzstack-dstack%E8%B4%A6%E5%8F%B7',
  openstack: 'https://onecloud-docs.com/docs/user/multiplecloud/cloudaccount/#%E6%96%B0%E5%BB%BAopenstack%E8%B4%A6%E5%8F%B7',
  vmware: 'https://onecloud-docs.com/docs/user/multiplecloud/cloudaccount/#%E6%96%B0%E5%BB%BAvmware%E8%B4%A6%E5%8F%B7',
  s3: 'https://onecloud-docs.com/docs/user/multiplecloud/cloudaccount/#%E6%96%B0%E5%BB%BAs3%E8%B4%A6%E5%8F%B7',
  ceph: 'https://onecloud-docs.com/docs/user/multiplecloud/cloudaccount/#%E6%96%B0%E5%BB%BAceph%E8%B4%A6%E5%8F%B7',
  xsky: 'https://onecloud-docs.com/docs/user/multiplecloud/cloudaccount/#%E6%96%B0%E5%BB%BAxsky%E8%B4%A6%E5%8F%B7', // !!! 未接入
}

export const ACCESS_URL = {
  huawei: {
    InternationalCloud: '全球区',
    ChinaCloud: '中国区',
  },
  aws: {
    InternationalCloud: '全球区',
    ChinaCloud: '中国区',
  },
  azure: {
    AzureChinaCloud: '中国区',
    AzurePublicCloud: '全球区',
    AzureUSGovernmentCloud: '美国政务区',
    AzureGermanCloud: '德国区',
  },
  ctyun: {
    InternationalCloud: '全球区',
    ChinaCloud: '中国区',
  },
}

export const keySecretFields = {
  aliyun: {
    k: 'access_key_id',
    s: 'access_key_secret',
    text: '阿里云',
    placeholder: {
      k: '请输入Access Key ID',
      s: '请输入Access Key Secret',
    },
    label: {
      k: '密钥ID',
      s: '密码',
    },
  },
  qcloud: {
    k: 'secret_id',
    s: 'secret_key',
    text: '腾讯云',
    placeholder: {
      k: '请输入SecretId',
      s: '请输入密码',
    },
    label: {
      k: '密钥ID',
      s: '密码',
    },
  },
  openstack: {
    k: 'username',
    s: 'password',
    text: 'OpenStack',
    placeholder: {
      k: '请输入账号',
      s: '请输入密码',
    },
    label: {
      k: '账号',
      s: '密码',
    },
  },
  vmware: {
    k: 'username',
    s: 'password',
    text: 'VMware',
    placeholder: {
      k: '请输入账号',
      s: '请输入密码',
    },
    label: {
      k: '账号',
      s: '密码',
    },
  },
  azure: {
    k: 'client_id',
    s: 'client_secret',
    text: 'Azure',
    placeholder: {
      k: '请输入应用程序ID',
      s: '请输入客户端密码',
    },
    label: {
      k: '客户端ID',
      s: '客户端密码',
    },
  },
  huawei: {
    k: 'access_key_id',
    s: 'access_key_secret',
    text: '华为云',
    placeholder: {
      k: '请输入Access Key ID',
      s: '请输入Access Key Secret',
    },
    label: {
      k: '密钥ID',
      s: '密码',
    },
  },
  aws: {
    k: 'access_key_id',
    s: 'access_key_secret',
    text: 'AWS',
    placeholder: {
      k: '请输入Access Key ID',
      s: '请输入Access Key Secret',
    },
    label: {
      k: '密钥ID',
      s: '密码',
    },
  },
  ucloud: {
    k: 'access_key_id',
    s: 'access_key_secret',
    text: 'UCloud',
    placeholder: {
      k: '请输入PublicKey',
      s: '请输入PrivateKey',
    },
    label: {
      k: '公钥',
      s: '私钥',
    },
  },
  dstack: {
    k: 'username',
    s: 'password',
    text: 'DStack',
    placeholder: {
      k: '请输入Access Key ID',
      s: '请输入Access Key Secret',
    },
    label: {
      k: '密钥ID',
      s: '密码',
    },
  },
  zstack: {
    k: 'username',
    s: 'password',
    text: 'ZStack',
    placeholder: {
      k: '请输入Access Key ID',
      s: '请输入Access Key Secret',
    },
    label: {
      k: '密钥ID',
      s: '密码',
    },
  },
  s3: {
    k: 'access_key_id',
    s: 'access_key_secret',
    text: 'S3',
    placeholder: {
      k: '请输入Access Key ID',
      s: '请输入Access Key Secret',
    },
    label: {
      k: '密钥ID',
      s: '密码',
    },
  },
  ceph: {
    k: 'access_key_id',
    s: 'access_key_secret',
    text: 'Ceph',
    placeholder: {
      k: '请输入Access Key ID',
      s: '请输入Access Key Secret',
    },
    label: {
      k: '密钥ID',
      s: '密码',
    },
  },
  xsky: {
    k: 'access_key_id',
    s: 'access_key_secret',
    text: 'XSKY',
    placeholder: {
      k: '请输入账号',
      s: '请输入密码',
    },
    label: {
      k: '账号',
      s: '密码',
    },
  },
  google: {
    s: 'private_key_id',
    k: 'private_key',
    text: 'Google',
    placeholder: {
      s: '请输入private_key_id',
      k: '请输入private_key',
    },
    label: {
      s: 'private_key_id',
      k: 'private_key',
    },
  },
  ctyun: {
    k: 'access_key_id',
    s: 'access_key_secret',
    text: '天翼云',
    placeholder: {
      k: '请输入Access Key ID',
      s: '请输入Access Key Secret',
    },
    label: {
      k: '密钥ID',
      s: '密码',
    },
  },
}
