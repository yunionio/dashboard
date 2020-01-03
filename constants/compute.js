import { HYPERVISORS_MAP } from '@/constants'

// 镜像类型
export const IMAGES_TYPE_MAP = {
  standard: { key: 'standard', label: '公共镜像', tooltip: 'OneCloud平台提供的公共镜像，可以适配所有平台使用' },
  customize: { key: 'customize', label: '自定义镜像', tooltip: '用户在OneCloud平台上传的自定义镜像' },
  iso: { key: 'iso', label: '从ISO启动' },
  host: { key: 'host', label: '主机镜像' },
  snapshot: { key: 'snapshot', label: '主机快照' },
  public: { key: 'public', label: '公有云镜像', tooltip: '公有云平台提供的标准镜像' },
  'public_customize': { key: 'public_customize', label: '公有云自定义镜像', tooltip: '用户在公有云平台上传的镜像' },
  private: { key: 'private', label: '私有云镜像', tooltip: '私有云平台提供的镜像' },
}

// 镜像图标
export const OS_ICONS = {
  'Aliyun': 'aliyun',
  'CentOS': 'centos',
  'CoreOS': 'coreos',
  'Debian': 'debian',
  'Freebsd': 'freebsd',
  'openSUSE': 'suse',
  'SUSE': 'suse',
  'Ubuntu': 'ubuntu',
  'Windows': 'windows',
}

// 公有云存储类型 + 私有云存储类型
export const STORAGE_TYPES = {
  [HYPERVISORS_MAP.aliyun.key]: {
    cloud: {
      label: '普通云盘',
      key: 'cloud',
      min: 5, // 数据盘或者新建云硬盘的取值范围【G】
      max: 2000, // 数据盘或者新建云硬盘的取值范围【G】
      sysMin: 20, // 系统盘取值范围【G】
      sysMax: 500, // 系统盘取值范围【G】
    },
    cloud_ssd: {
      label: 'SSD 云盘',
      key: 'cloud_ssd',
      min: 20,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_essd: {
      label: 'ESSD云盘PL1',
      key: 'cloud_essd',
      min: 20,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_essd_pl2: {
      label: 'ESSD云盘PL2',
      key: 'cloud_essd_pl2',
      min: 461,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_essd_pl3: {
      label: 'ESSD云盘PL3',
      key: 'cloud_essd_pl3',
      min: 1261,
      max: 32768,
      sysMin: 20,
      sysMax: 500,
    },
    cloud_efficiency: {
      label: '高效云盘',
      key: 'cloud_efficiency',
      min: 20,
      max: 32768,
      default: true,
      sysMin: 20,
      sysMax: 500,
    },
    ephemeral_ssd: {
      label: '本地 SSD 盘',
      key: 'ephemeral_ssd',
      min: 5,
      max: 800,
      sysMin: 20,
      sysMax: 500,
    },
  },
  [HYPERVISORS_MAP.aws.key]: {
    gp2: {
      label: '通用型 SSD',
      key: 'gp2',
      min: 1,
      max: 16384,
      default: true,
      sysMin: 1,
      sysMax: 16384,
    },
    io1: {
      label: '预配置 IOPS SSD',
      key: 'io1',
      min: 4,
      max: 16384,
      sysMin: 1,
      sysMax: 16384,
    },
    st1: {
      label: '吞吐优化 HDD',
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
      label: '磁介质',
      key: 'standard',
      min: 1,
      max: 1024,
      sysMin: 1,
      sysMax: 16384,
    },
  },
  [HYPERVISORS_MAP.qcloud.key]: {
    cloud_basic: {
      label: '普通云硬盘',
      key: 'cloud_basic',
      min: 10,
      max: 16000,
      default: true,
      sysMin: 50,
      sysMax: 500,
      resizeStep: 10,
    },
    cloud_premium: {
      label: '高性能云硬盘',
      key: 'cloud_premium',
      min: 50,
      max: 16000,
      sysMin: 50,
      sysMax: 1024,
      resizeStep: 10,
    },
    cloud_ssd: {
      label: 'SSD 云硬盘',
      key: 'cloud_ssd',
      min: 100,
      max: 16000,
      sysMin: 50,
      sysMax: 500,
      resizeStep: 10,
    },
  },
  [HYPERVISORS_MAP.azure.key]: {
    standard_lrs: {
      label: '标准 HDD',
      key: 'standard_lrs',
      min: 1,
      max: 4095,
      default: true,
      sysMin: 30,
      sysMax: 4095,
    },
    standardssd_lrs: {
      label: '标准 SSD',
      key: 'standardssd_lrs',
      min: 1,
      max: 4095,
      sysMin: 30,
      sysMax: 4095,
    },
    premium_lrs: {
      label: '高级 SSD',
      key: 'premium_lrs',
      min: 1,
      max: 4095,
      sysMin: 30,
      sysMax: 4095,
    },
  },
  [HYPERVISORS_MAP.kvm.key]: {
    local: {
      label: '本地硬盘',
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
      label: '本地硬盘',
      key: 'local',
      min: 1,
      max: 3 * 1024,
      default: true,
      sysMin: 10,
      sysMax: 500,
      unCreateCloud: true, // 不支持创建云硬盘
    },
    nas: {
      label: 'nas 云盘',
      key: 'nas',
      min: 1,
      max: 3 * 1024,
      sysMin: 10,
      sysMax: 500,
      unCreateCloud: true, // 不支持创建云硬盘
    },
    vsan: {
      label: 'vsan 云盘',
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
      label: '超高IO云硬盘',
      key: 'SSD',
      min: 10,
      max: 32768,
      sysMin: 20,
      sysMax: 1024,
      sort: 3,
    },
    SAS: {
      label: '高IO云硬盘',
      key: 'SAS',
      min: 10,
      max: 32768,
      sysMin: 20,
      sysMax: 1024,
      sort: 2,
    },
    SATA: {
      label: '普通IO云硬盘',
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
      label: '本地云盘',
      key: 'localstorage',
      min: 1,
      max: 3 * 1024,
      default: true,
      sysMin: 10,
      sysMax: 500,
    },
    ceph: {
      label: '共享云盘',
      key: 'ceph',
      min: 1,
      max: 3 * 1024,
      sysMin: 10,
      sysMax: 500,
    },
  },
  [HYPERVISORS_MAP.ucloud.key]: {
    LOCAL_NORMAL: {
      label: '本地普通盘',
      key: 'LOCAL_NORMAL',
      min: 20,
      max: 2000,
      sysMin: 10,
      sysMax: 500,
      skuFamily: ['N1', 'N2', 'N3', 'D1'],
    },
    LOCAL_SSD: {
      label: '本地SSD盘',
      key: 'LOCAL_SSD',
      min: 20,
      max: 2000,
      sysMin: 10,
      sysMax: 500,
      skuFamily: ['C1', 'I2', 'G2', 'G3', 'I1', 'G1'],
    },
    CLOUD_NORMAL: {
      label: '普通云盘',
      key: 'CLOUD_NORMAL',
      min: 20,
      max: 8000,
      sysUnusable: true, // 系统盘不可用
      skuFamily: ['N2', 'N3'],
    },
    CLOUD_SSD: {
      label: 'SSD云盘',
      key: 'CLOUD_SSD',
      min: 20,
      max: 4000,
      sysMin: 20,
      sysMax: 500,
      skuFamily: ['N3', 'C1', 'N2', 'I2', 'G2', 'G3'],
    },
    EXCLUSIVE_LOCAL_DISK: {
      label: '独享本地盘',
      key: 'EXCLUSIVE_LOCAL_DISK',
      min: 4096,
      max: 4096,
      sysUnusable: true, // 系统盘不可用
      skuFamily: ['D1'],
    },
  },
}

// 磁盘挂载点配置
export const DISK_MOUNT_POINT_OPTIONS = [
  { key: 'ext4', label: 'ext4' },
  { key: 'xfs', label: 'xfs' },
  { key: 'swap', label: 'swap' },
]
