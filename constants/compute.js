import i18n from '@/locales'
import { HYPERVISORS_MAP } from '@/constants'
// 镜像类型
export const IMAGES_TYPE_MAP = {
  standard: { key: 'standard', label: i18n.t('label.standardImage'), tooltip: i18n.t('common.text00016') },
  customize: { key: 'customize', label: i18n.t('common.text00017'), tooltip: i18n.t('common.text00018') },
  iso: { key: 'iso', label: i18n.t('common.text00019'), tooltip: i18n.t('common.text00020') },
  host: { key: 'host', label: i18n.t('common.text00021'), tooltip: i18n.t('common.text00022') },
  snapshot: { key: 'snapshot', label: i18n.t('common.text00023'), tooltip: i18n.t('common.text00024') },
  public: { key: 'public', label: i18n.t('common.text00025'), tooltip: i18n.t('common.text00026') },
  public_customize: { key: 'public_customize', label: i18n.t('common.text00027'), tooltip: i18n.t('common.text00028'), enable_cloudaccount: true },
  private: { key: 'private', label: i18n.t('common.text00029'), tooltip: i18n.t('common.text00030'), enable_cloudaccount: true },
  vmware: { key: 'vmware', label: i18n.t('common.text00031'), tooltip: i18n.t('common.text00032'), enable_cloudaccount: true },
}

// 镜像图标
export const OS_ICONS = {
  Aliyun: 'aliyun',
  CentOS: 'centos',
  CoreOS: 'coreos',
  Debian: 'debian',
  Freebsd: 'freebsd',
  openSUSE: 'suse',
  SUSE: 'suse',
  Ubuntu: 'ubuntu',
  Windows: 'windows',
}

// 公有云存储类型 + 私有云存储类型
export const STORAGE_TYPES = {
  [HYPERVISORS_MAP.aliyun.key]: {
    cloud: {
      label: i18n.t('common.storage.cloud'),
      key: 'cloud',
      min: 5, // 数据盘或者新建云硬盘的取值范围【G】
      max: 2000, // 数据盘或者新建云硬盘的取值范围【G】
      sysMin: 20, // 系统盘取值范围【G】
      sysMax: 500, // 系统盘取值范围【G】
    },
    cloud_ssd: {
      label: i18n.t('common.storage.cloudssd'),
      key: 'cloud_ssd',
      min: 20,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_essd: {
      label: i18n.t('common.storage.cloudessd'),
      key: 'cloud_essd',
      min: 20,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_essd_pl2: {
      label: i18n.t('common.storage.cloudessdpl2'),
      key: 'cloud_essd_pl2',
      min: 461,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_essd_pl3: {
      label: i18n.t('common.storage.cloudessdpl3'),
      key: 'cloud_essd_pl3',
      min: 1261,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_efficiency: {
      label: i18n.t('common.storage.cloudefficiency'),
      key: 'cloud_efficiency',
      min: 20,
      max: 32768,
      default: true,
      sysMin: 20,
      sysMax: 500,
    },
    ephemeral_ssd: {
      label: i18n.t('common.storage.ephemeralssd'),
      key: 'ephemeral_ssd',
      min: 5,
      max: 800,
      sysMin: 20,
      sysMax: 500,
    },
  },
  [HYPERVISORS_MAP.aws.key]: {
    gp2: {
      label: i18n.t('common.storage.gp2'),
      key: 'gp2',
      min: 1,
      max: 16384,
      default: true,
      sysMin: 1,
      sysMax: 16384,
    },
    io1: {
      label: i18n.t('common.storage.io', ['io1']),
      key: 'io1',
      min: 4,
      max: 16384,
      sysMin: 1,
      sysMax: 16384,
    },
    io2: {
      label: i18n.t('common.storage.io', ['io2']),
      key: 'io1',
      min: 4,
      max: 16384,
      sysMin: 1,
      sysMax: 16384,
    },
    st1: {
      label: i18n.t('common.storage.st1'),
      key: 'st1',
      sysUnusable: true, // 系统盘不可用
      min: 500,
      max: 16384,
    },
    sc1: {
      label: 'Cold HDD',
      key: 'sc1',
      sysUnusable: true, // 系统盘不可用
      min: 500,
      max: 16384,
    },
    standard: {
      label: i18n.t('common.storage.standard'),
      key: 'standard',
      min: 1,
      max: 1024,
      sysMin: 1,
      sysMax: 16384,
    },
  },
  [HYPERVISORS_MAP.qcloud.key]: {
    cloud_basic: {
      label: i18n.t('common.storage.cloudbasic'),
      key: 'cloud_basic',
      min: 10,
      max: 16000,
      default: true,
      sysMin: 50,
      sysMax: 500,
      resizeStep: 10,
    },
    cloud_premium: {
      label: i18n.t('common.storage.cloudpremium'),
      key: 'cloud_premium',
      min: 50,
      max: 16000,
      sysMin: 50,
      sysMax: 1024,
      resizeStep: 10,
    },
    cloud_ssd: {
      label: i18n.t('common.storage.cloudssd'),
      key: 'cloud_ssd',
      min: 100,
      max: 16000,
      sysMin: 50,
      sysMax: 500,
      resizeStep: 10,
    },
    cloud_hssd: {
      label: i18n.t('common.storage.cloudhssd'),
      key: 'cloud_hssd',
      min: 100,
      max: 16000,
      sysMin: 50,
      sysMax: 500,
      resizeStep: 10,
      sysUnusable: true, // 系统盘不可用
    },
  },
  [HYPERVISORS_MAP.azure.key]: {
    standard_lrs: {
      label: i18n.t('common.storage.standardlrs'),
      key: 'standard_lrs',
      min: 1,
      max: 4095,
      default: true,
      sysMin: 30,
      sysMax: 4095,
    },
    standardssd_lrs: {
      label: i18n.t('common.storage.standardssdlrs'),
      key: 'standardssd_lrs',
      min: 1,
      max: 4095,
      sysMin: 30,
      sysMax: 4095,
    },
    premium_lrs: {
      label: i18n.t('common.storage.premiumlrs'),
      key: 'premium_lrs',
      min: 1,
      max: 4095,
      sysMin: 30,
      sysMax: 4095,
    },
  },
  [HYPERVISORS_MAP.kvm.key]: {
    local: {
      label: i18n.t('common.storage.local'),
      key: 'local',
      min: 1,
      max: 3 * 1024,
      default: true,
      sysMin: 10,
      sysMax: 500,
      unCreateCloud: true, // 不支持创建云硬盘
    },
    rbd: {
      label: 'Ceph RBD',
      key: 'rbd',
      min: 1,
      max: 3 * 1024,
      sysMin: 10,
      sysMax: 500,
    },
    gpfs: {
      label: 'GPFS',
      key: 'gpfs',
      min: 1,
      max: 3 * 1024,
      sysMin: 10,
      sysMax: 500,
      unCreateCloud: true, // 不支持创建云硬盘
    },
  },
  [HYPERVISORS_MAP.esxi.key]: {
    local: {
      label: i18n.t('common.storage.local'),
      key: 'local',
      min: 1,
      max: 3 * 1024,
      default: true,
      sysMin: 10,
      sysMax: 500,
      unCreateCloud: true, // 不支持创建云硬盘
    },
    nas: {
      label: i18n.t('common.storage.nas'),
      key: 'nas',
      min: 1,
      max: 3 * 1024,
      sysMin: 10,
      sysMax: 500,
      unCreateCloud: true, // 不支持创建云硬盘
    },
    vsan: {
      label: i18n.t('common.storage.vsan'),
      key: 'vsan',
      min: 1,
      max: 3 * 1024,
      sysMin: 10,
      sysMax: 500,
      unCreateCloud: true, // 不支持创建云硬盘
    },
  },
  [HYPERVISORS_MAP.huawei.key]: {
    SSD: {
      label: i18n.t('common.storage.ssd'),
      key: 'SSD',
      min: 10,
      max: 32768,
      sysMin: 20,
      sysMax: 1024,
      sort: 3,
    },
    SAS: {
      label: i18n.t('common.storage.sas'),
      key: 'SAS',
      min: 10,
      max: 32768,
      sysMin: 20,
      sysMax: 1024,
      sort: 2,
    },
    SATA: {
      label: i18n.t('common.storage.sata'),
      key: 'SATA',
      min: 10,
      max: 32768,
      default: true,
      sysMin: 20,
      sysMax: 1024,
      sort: 1,
    },
  },
  [HYPERVISORS_MAP.openstack.key]: {
    iscsi: {
      label: 'iscsi',
      key: 'iscsi',
      min: 1,
      max: 3 * 1024,
      sysMin: 10,
      sysMax: 500,
    },
  },
  [HYPERVISORS_MAP.zstack.key]: {
    localstorage: {
      label: i18n.t('common.storage.localstorage'),
      key: 'localstorage',
      min: 1,
      max: 3 * 1024,
      default: true,
      sysMin: 10,
      sysMax: 500,
    },
    ceph: {
      label: i18n.t('common.storage.ceph'),
      key: 'ceph',
      min: 1,
      max: 3 * 1024,
      sysMin: 10,
      sysMax: 500,
    },
  },
  [HYPERVISORS_MAP.ucloud.key]: {
    LOCAL_NORMAL: {
      label: i18n.t('common.storage.LOCAL_NORMAL'),
      key: 'LOCAL_NORMAL',
      min: 20,
      max: 2000,
      sysMin: 10,
      sysMax: 500,
      skuFamily: ['N1', 'N2', 'N3', 'D1'],
    },
    LOCAL_SSD: {
      label: i18n.t('common.storage.LOCAL_SSD'),
      key: 'LOCAL_SSD',
      min: 20,
      max: 2000,
      sysMin: 10,
      sysMax: 500,
      skuFamily: ['C1', 'I2', 'G2', 'G3', 'I1', 'G1'],
    },
    CLOUD_NORMAL: {
      label: i18n.t('common.storage.cloud'),
      key: 'CLOUD_NORMAL',
      min: 20,
      max: 8000,
      sysUnusable: true, // 系统盘不可用
      skuFamily: ['N2', 'N3'],
    },
    CLOUD_SSD: {
      label: i18n.t('common.storage.cloudssd'),
      key: 'CLOUD_SSD',
      min: 20,
      max: 4000,
      sysMin: 20,
      sysMax: 500,
      skuFamily: ['N3', 'C1', 'N2', 'I2', 'G2', 'G3'],
    },
    EXCLUSIVE_LOCAL_DISK: {
      label: i18n.t('common.storage.EXCLUSIVE_LOCAL_DISK'),
      key: 'EXCLUSIVE_LOCAL_DISK',
      min: 4096,
      max: 4096,
      sysUnusable: true, // 系统盘不可用
      skuFamily: ['D1'],
    },
  },
  [HYPERVISORS_MAP.ctyun.key]: {
    SSD: {
      label: i18n.t('common.storage.ssd'),
      key: 'SSD',
      min: 10,
      max: 32768,
      sysMin: 20,
      sysMax: 1024,
      sort: 3,
    },
    SAS: {
      label: i18n.t('common.storage.sas'),
      key: 'SAS',
      min: 10,
      max: 32768,
      sysMin: 20,
      sysMax: 1024,
      sort: 2,
    },
    SATA: {
      label: i18n.t('common.storage.sata'),
      key: 'SATA',
      min: 10,
      max: 32768,
      default: true,
      sysMin: 20,
      sysMax: 1024,
      sort: 1,
    },
  },
  [HYPERVISORS_MAP.google.key]: {
    'pd-ssd': {
      label: i18n.t('common.storage.pd-ssd'),
      key: 'pd-ssd',
      min: 10,
      max: 65536,
      sysMin: 10,
      sysMax: 65536,
      sort: 1,
    },
    'pd-standard': {
      label: i18n.t('common.storage.pd-standard'),
      key: 'pd-standard',
      min: 10,
      max: 65536,
      sysMin: 10,
      sysMax: 65536,
      sort: 2,
    },
    'local-ssd': {
      label: i18n.t('common.storage.LOCAL_SSD'),
      key: 'local-ssd',
      min: 375,
      max: 375,
      sysMin: 375,
      sysMax: 375,
      sort: 3,
    },
    'pd-balanced': {
      label: i18n.t('common.storage.pd-balanced'),
      key: 'pd-balanced',
      min: 10,
      max: 65536,
      sysMin: 10,
      sysMax: 65536,
      sort: 2,
    },
  },
  [HYPERVISORS_MAP.apsara.key]: {
    cloud: {
      label: i18n.t('common.storage.cloud'),
      key: 'cloud',
      min: 5, // 数据盘或者新建云硬盘的取值范围【G】
      max: 2000, // 数据盘或者新建云硬盘的取值范围【G】
      sysMin: 20, // 系统盘取值范围【G】
      sysMax: 500, // 系统盘取值范围【G】
    },
    cloud_ssd: {
      label: i18n.t('common.storage.cloudssd'),
      key: 'cloud_ssd',
      min: 20,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_essd: {
      label: i18n.t('common.storage.cloudessd'),
      key: 'cloud_essd',
      min: 20,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_essd_pl2: {
      label: i18n.t('common.storage.cloudessdpl2'),
      key: 'cloud_essd_pl2',
      min: 461,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_essd_pl3: {
      label: i18n.t('common.storage.cloudessdpl3'),
      key: 'cloud_essd_pl3',
      min: 1261,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_efficiency: {
      label: i18n.t('common.storage.cloudefficiency'),
      key: 'cloud_efficiency',
      min: 20,
      max: 32768,
      default: true,
      sysMin: 20,
      sysMax: 500,
    },
    ephemeral_ssd: {
      label: i18n.t('common.storage.ephemeralssd'),
      key: 'ephemeral_ssd',
      min: 5,
      max: 800,
      sysMin: 20,
      sysMax: 500,
    },
  },
}

// 磁盘挂载点配置
export const DISK_MOUNT_POINT_OPTIONS = [
  { key: 'ext4', label: 'ext4' },
  { key: 'xfs', label: 'xfs' },
  { key: 'swap', label: 'swap' },
]

export const HOST_CPU_ARCHS = {
  x86: {
    key: 'x86',
    label: 'x86',
    capabilityKey: 'x86_64',
  },
  arm: {
    key: 'arm',
    label: 'ARM',
    capabilityKey: 'aarch64',
  },
}
