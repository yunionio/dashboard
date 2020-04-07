import { typeClouds } from '@/utils/common/hypervisor'

export const providerMap = typeClouds.getProviderlowcase()
const aliyunLogo = require('../../../src/assets/images/providers/aliyun.svg')
const awsLogo = require('../../../src/assets/images/providers/aws.svg')
const azureLogo = require('../../../src/assets/images/providers/azure.svg')
const huaweiLogo = require('../../../src/assets/images/providers/huawei.svg')
const qcloudLogo = require('../../../src/assets/images/providers/qcloud.svg')
const ucloudLogo = require('../../../src/assets/images/providers/ucloud.svg')
const vmwareLogo = require('../../../src/assets/images/providers/vmware.svg')
const openstackLogo = require('../../../src/assets/images/providers/openstack.svg')
const dstackLogo = require('../../../src/assets/images/providers/dstack.svg')
const zstackLogo = require('../../../src/assets/images/providers/zstack.svg')
const s3Logo = require('../../../src/assets/images/providers/s3.svg')
const cephLogo = require('../../../src/assets/images/providers/ceph.svg')
const xskyLogo = require('../../../src/assets/images/providers/xsky.svg')
const googleLogo = require('../../../src/assets/images/providers/gcp.svg')
const ctyunLogo = require('../../../src/assets/images/providers/tianyi.svg')
const k8sLogo = require('../../../src/assets/images/providers/k8s.svg')
const serverLogo = require('../../../src/assets/images/providers/server.svg')
const oneCloudLogo = require('../../../src/assets/images/providers/onecloud.svg')

export const ENVS = ['public', 'onestack', 'baremetal', 'container', 'vmware', 'private', 's3']
export const ENV_TITLE = {
  'public': '公有云',
  'onestack': '内置私有云',
  'baremetal': '裸金属',
  'container': '容器管理',
  'vmware': 'VMWare',
  'private': '私有云',
  's3': 'S3',
}

const VM_URL = '/vminstance'
const PHY_URL = '/physicalmachine'
const CLUSTERS = '/clusters'
const BUCKET_URL = '/bucket'
export const ENV_FORMS = {
  'public': ['Cloundacount', 'Iso', VM_URL],
  'onestack': ['Region', 'Zone', 'Wire', 'Network', 'Host', 'Storage', 'ShareStorage', VM_URL],
  'baremetal': ['Region', 'Zone', 'Wire', 'Network', 'Iso', PHY_URL],
  'container': ['Region', 'Zone', 'Wire', 'Network', 'Iso', CLUSTERS],
  'vmware': ['Cloundacount', 'Region', 'Zone', 'Wire', 'Network', 'Iso', VM_URL],
  'private': ['Cloundacount', 'Iso', VM_URL],
  's3': ['Cloundacount', BUCKET_URL],
}
export const ENV_FORMS_CONFIG = {
  [VM_URL]: {
    title: '虚拟机',
    icon: 'blank',
  },
  [PHY_URL]: {
    title: '物理机',
    icon: 'blank',
  },
  [CLUSTERS]: {
    title: '容器集群',
    icon: 'blank',
  },
  [BUCKET_URL]: {
    title: '对象存储',
    icon: 'blank',
  },
  Cloundacount: {
    title: '云账号',
  },
  Iso: {
    title: '镜像',
    helpMessages: [
      '镜像是系统统一资源，所有平台或区域创建云主机均可使用。',
      '系统提供了镜像市场功能，建议用户直接从镜像市场导入所需的镜像，以便快速使用系统。',
      '从镜像市场导入镜像，需要系统所在机器能够联通外网，导入的速度和镜像的大小、网速有关，一般导入一个镜像需要20-30分钟。',
      'URL上传完成后，系统会自动把上传镜像的格式（除IOS格式外），转化成系统可用格式，一般转换过程需要10-15分钟。',
      '容器管理必须选择k8镜像',
    ],
  },
  Region: {
    title: '区域',
    helpMessages: [
      '区域指数据中心所在的地理位置，一般为城市，比如：北京、青岛等。',
      '区域包含可用区、VPC、二层网络、IP子网、宿主机、存储等资源。',
    ],
  },
  Zone: {
    title: '可用区',
    helpMessages: [
      '可用区指在同一区域内，电力和网络相互独立的物理区域，一般指一个机房的名称，例如：望京、酒仙桥、兆维等。',
      '可用区是区域的子资源，本次创建默认选中了系统已创建的区域。',
      '可用区包含二层网络、IP子网、宿主机、存储等资源。',
    ],
  },
  Wire: {
    title: '二层网络',
    helpMessages: [
      '二层网络是指在IP子网之上做的一层逻辑的网络隔离',
      '二层网络是可用区的子资源，可在不同可用区下创建多个二层网络。',
      'VMware环境建议配置多个二层网络。',
    ],
  },
  Network: {
    title: 'IP子网',
    helpMessages: [
      'IP子网是云主机使用的私有网络，用于创建云主机。',
      'IP子网属于二层网络子资源，最多可创建5个虚拟机网段。',
    ],
  },
  Host: {
    title: '宿主机',
    helpMessages: [
      '宿主机是可用区的子资源，本次创建默认展示了所有可用区中的宿主机。',
      '可修改宿主机名称，或禁用/启用宿主机。',
    ],
  },
  Storage: {
    title: '本地存储',
    helpMessages: [
      '存储是可用区的子资源，本次创建默认展现了所有可用区下宿主机的存储。',
      '可修改存储名称，或禁用/启用存储。',
    ],
  },
  ShareStorage: {
    title: '共享存储',
    helpMessages: [
      '共享存储是可用区的子资源，可添加多个Ceph和NFS存储。',
      '可添加、修改删除共享存储。',
    ],
  },
}

// 'baremetal': '公有云'
const SUB_EBV_ITMS_PUBLIC = {
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
}

// 'baremetal': '裸金属'
const SUB_EBV_ITMS_BAREMETAL = {
  'baremetal': {
    name: '服务器',
    logo: serverLogo,
    // component: 'CtyunCreate',
    // provider: providerMap.ctyun.key,
  },
}

// 'container': '容器管理'
const SUB_EBV_ITMS_CONTAINER = {
  'container': {
    logo: k8sLogo,
    logoStyle: {
      width: '105px',
    },
  },
}

// 'vmware': 'VMWare'
const SUB_EBV_ITMS_VMWAREA = {
  'vmware': {
    name: 'VMWare',
    logo: vmwareLogo,
    component: 'VMwareCreate',
    provider: providerMap.vmware.key,
  },
}

// 'private': '私有云'
const SUB_EBV_ITMS_PRIVATE = {
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
}

// 's3': 'S3',
const SUB_EBV_ITMS_S3 = {
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
}

const SUB_EBV_ITMS_ONESTACK = {
  'onestack': {
    name: 'OneStack',
    logo: oneCloudLogo,
  },
}

export const SUB_EBV_ITMS = {
  'public': SUB_EBV_ITMS_PUBLIC,
  'onestack': SUB_EBV_ITMS_ONESTACK,
  'baremetal': SUB_EBV_ITMS_BAREMETAL,
  'container': SUB_EBV_ITMS_CONTAINER,
  'vmware': SUB_EBV_ITMS_VMWAREA,
  'private': SUB_EBV_ITMS_PRIVATE,
  's3': SUB_EBV_ITMS_S3,
}
