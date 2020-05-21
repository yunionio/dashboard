import { DISK_TYPES, ALL_STORAGE_LABEL } from '../../../constants'
import status from '@/locales/zh-CN'
import { PROVIDER_MAP } from '@/constants'
const { disk: diskStatus, server: serverStatus } = status.status

const _tran = (enArr, status = diskStatus) => {
  return enArr.map(v => status[v] || v).filter(v => v).join('，')
}

// 磁盘扩容的逻辑梳理
export const diskResizeConfig = {
  base (obj) {
    const status = ['ready']
    const validate = status.includes(obj.status)
    return {
      validate,
      tooltip: validate ? '' : `仅在磁盘状态为【${_tran(status)}】下可以进行该操作`,
    }
  },
  vmware (obj) {
    const diskType = 'data'
    const provider = obj.provider
    // const { validate, tooltip } = diskResizeConfig.base(obj)
    // if (!validate) {
    //   return {
    //     validate: false,
    //     tooltip,
    //   }
    // }
    if (obj.guest_status === 'running') {
      return {
        validate: false,
      }
    }
    if (obj.disk_type !== diskType) {
      return {
        validate: false,
        tooltip: `${PROVIDER_MAP[provider].label}磁盘仅在磁盘类型为【${DISK_TYPES[diskType]}】下可以进行该操作`,
      }
    }
    return {
      validate: true,
      tooltip: '',
    }
  },
  onecloud (obj) {
    const diskType = 'data'
    const provider = obj.provider
    const { validate, tooltip } = diskResizeConfig.base(obj)
    if (!validate) {
      return {
        validate: false,
        tooltip,
      }
    }
    if (obj.guest_status === 'running' && obj.disk_type !== diskType) {
      return {
        validate: false,
        tooltip: `${PROVIDER_MAP[provider].label}系统盘不支持开机扩容`,
      }
    }
    return {
      validate: true,
      tooltip: '',
    }
  },
  openstack (obj) {
    const diskType = 'data'
    const provider = obj.provider
    // const { validate, tooltip } = diskResizeConfig.base(obj)
    // if (!validate) {
    //   return {
    //     validate: false,
    //     tooltip,
    //   }
    // }
    if (obj.guest_status === 'running') {
      return {
        validate: false,
        tooltip: `${PROVIDER_MAP[provider].label}不支持开机扩容`,
      }
    }
    if (obj.disk_type !== diskType) {
      return {
        validate: false,
        tooltip: `${PROVIDER_MAP[provider].label}磁盘仅在磁盘类型为【${DISK_TYPES[diskType]}】下可以进行该操作`,
      }
    }
    return {
      validate: true,
      tooltip: '',
    }
  },
  zstack (obj) {
    const guestStatus = ['ready', 'running']
    const provider = obj.provider
    const { validate, tooltip } = diskResizeConfig.base(obj)
    if (!validate) {
      return {
        validate: false,
        tooltip,
      }
    }
    if (!guestStatus.includes(obj.guest_status)) {
      return {
        validate: false,
        tooltip: `${PROVIDER_MAP[provider].label}磁盘仅在挂载主机状态为【${_tran(guestStatus, serverStatus)}】下可以进行该操作`,
      }
    }
    return {
      validate: true,
      tooltip: '',
    }
  },
  dstack (obj) {
    const guestStatus = ['ready', 'running']
    const provider = obj.provider
    const { validate, tooltip } = diskResizeConfig.base(obj)
    if (!validate) {
      return {
        validate: false,
        tooltip,
      }
    }
    if (!guestStatus.includes(obj.guest_status)) {
      return {
        validate: false,
        tooltip: `${PROVIDER_MAP[provider].label}磁盘仅在挂载主机状态为【${_tran(guestStatus, serverStatus)}】下可以进行该操作`,
      }
    }
    return {
      validate: true,
      tooltip: '',
    }
  },
  aliyun (obj) {
    const provider = obj.provider
    const diskType = 'data'
    const storageType = ['cloud', 'cloud_efficiency', 'cloud_ssd']
    const { validate, tooltip } = diskResizeConfig.base(obj)
    if (!validate) {
      return {
        validate: false,
        tooltip,
      }
    }
    if (obj.disk_type !== diskType) {
      return {
        validate: false,
        tooltip: `${PROVIDER_MAP[provider].label}磁盘仅在磁盘类型为【${DISK_TYPES[diskType]}】下可以进行该操作`,
      }
    }
    if (!storageType.includes(obj.storage_type)) {
      return {
        validate: false,
        tooltip: `${PROVIDER_MAP[provider].label}磁盘在磁盘存储类型为【${_tran(storageType, ALL_STORAGE_LABEL)}】下可以进行该操作`,
      }
    }
    return {
      validate: true,
      tooltip: '',
    }
  },
  qcloud (obj) {
    const provider = obj.provider
    const guestStatus = ['ready', 'running']
    const diskType = 'data'
    const notInStorageType = ['local_basic', 'local_ssd']
    const { validate, tooltip } = diskResizeConfig.base(obj)
    if (!validate) {
      return {
        validate: false,
        tooltip,
      }
    }
    if (!guestStatus.includes(obj.guest_status)) {
      return {
        validate: false,
        tooltip: `${PROVIDER_MAP[provider].label}磁盘仅在挂载主机状态为【${_tran(guestStatus, serverStatus)}】下可以进行该操作`,
      }
    }
    if (obj.disk_type !== diskType) {
      return {
        validate: false,
        tooltip: `${PROVIDER_MAP[provider].label}磁盘仅在磁盘类型为【${DISK_TYPES[diskType]}】下可以进行该操作`,
      }
    }
    if (notInStorageType.includes(obj.storage_type)) {
      return {
        validate: false,
        tooltip: `${PROVIDER_MAP[provider].label}磁盘在磁盘存储类型为【${_tran(notInStorageType, ALL_STORAGE_LABEL)}】下不可以进行该操作`,
      }
    }
    return {
      validate: true,
      tooltip: '',
    }
  },
  aws (obj) {
    const { validate, tooltip } = diskResizeConfig.base(obj)
    if (!validate) {
      return {
        validate: false,
        tooltip,
      }
    }
    return {
      validate: true,
      tooltip: '',
    }
  },
  huawei (obj) {
    const { validate, tooltip } = diskResizeConfig.base(obj)
    if (!validate) {
      return {
        validate: false,
        tooltip,
      }
    }
    return {
      validate: true,
      tooltip: '',
    }
  },
  azure (obj) {
    const provider = obj.provider
    const guestStatus = ['ready']
    const { validate, tooltip } = diskResizeConfig.base(obj)
    if (!validate) {
      return {
        validate: false,
        tooltip,
      }
    }
    const azureValid = guestStatus.includes(obj.guest_status)
    return {
      validate: azureValid,
      tooltip: azureValid ? '' : `${PROVIDER_MAP[provider].label}磁盘仅在挂载主机状态为【${_tran(guestStatus, serverStatus)}】下可以进行该操作`,
    }
  },
  ucloud (obj) {
    const diskType = 'data'
    const provider = obj.provider
    const { validate, tooltip } = diskResizeConfig.base(obj)
    if (!validate) {
      return {
        validate: false,
        tooltip,
      }
    }
    if (obj.disk_type !== diskType) {
      return {
        validate: false,
        tooltip: `${PROVIDER_MAP[provider].label}磁盘仅在磁盘类型为【${DISK_TYPES[diskType]}】下可以进行该操作`,
      }
    }
    if (obj.guest) {
      return {
        validate: false,
        tooltip: '请选择未挂载的磁盘',
      }
    }
    return {
      validate: true,
      tooltip: '',
    }
  },
  google (obj) {
    const { validate, tooltip } = diskResizeConfig.base(obj)
    if (!validate) {
      return {
        validate: false,
        tooltip,
      }
    }
    return {
      validate: true,
      tooltip: '',
    }
  },
  ctyun (obj) {
    const { validate, tooltip } = diskResizeConfig.base(obj)
    if (!validate) {
      return {
        validate: false,
        tooltip,
      }
    }
    return {
      validate: true,
      tooltip: '',
    }
  },
}

// 磁盘新建快照的逻辑梳理
export const diskCreateSnapshotConfig = {
  vmware (obj) {
    const provider = obj.provider
    return {
      validate: false,
      tooltip: `【${PROVIDER_MAP[provider].label}}】不支持该操作`,
    }
  },
  onecloud (obj) {
    const provider = obj.provider
    const guestStatus = ['ready', 'running']
    if (obj.guest && !guestStatus.includes(obj.guest_status)) {
      return {
        validate: false,
        tooltip: `若${PROVIDER_MAP[provider].label}磁盘已挂载，仅在主机状态为【${_tran(guestStatus, serverStatus)}】下可以进行该操作`,
      }
    }
    if (!obj.guest && obj.storage_type === 'local') {
      return {
        validate: false,
        tooltip: '',
      }
    }
    return {
      validate: true,
      tooltip: '',
    }
  },
  openstack (obj) {
    const guestStatus = ['ready', 'running']
    const provider = obj.provider
    if (obj.storage_type === 'nova') {
      return {
        validate: false,
        tooltip: `${PROVIDER_MAP[provider].label}以镜像为系统盘不支持创建快照`,
      }
    }
    if (obj.guest_status && !guestStatus.includes(obj.guest_status)) {
      return {
        validate: false,
        tooltip: `${PROVIDER_MAP[provider].label}磁盘仅在挂载主机状态为【${_tran(guestStatus, serverStatus)}】下可以进行该操作`,
      }
    }
    return {
      validate: true,
      tooltip: '',
    }
  },
  zstack (obj) {
    const guestStatus = ['ready', 'running']
    const provider = obj.provider
    if (!guestStatus.includes(obj.guest_status)) {
      return {
        validate: false,
        tooltip: `${PROVIDER_MAP[provider].label}磁盘仅在挂载主机状态为【${_tran(guestStatus, serverStatus)}】下可以进行该操作`,
      }
    }
    return {
      validate: true,
      tooltip: '',
    }
  },
  dstack (obj) {
    const guestStatus = ['ready', 'running']
    const provider = obj.provider
    if (!guestStatus.includes(obj.guest_status)) {
      return {
        validate: false,
        tooltip: `${PROVIDER_MAP[provider].label}磁盘仅在挂载主机状态为【${_tran(guestStatus, serverStatus)}】下可以进行该操作`,
      }
    }
    return {
      validate: true,
      tooltip: '',
    }
  },
  aliyun (obj) {
    const guestStatus = ['ready', 'running']
    const provider = obj.provider
    if (!guestStatus.includes(obj.guest_status)) {
      return {
        validate: false,
        tooltip: `${PROVIDER_MAP[provider].label}磁盘仅在挂载主机状态为【${_tran(guestStatus, serverStatus)}】下可以进行该操作`,
      }
    }
    return {
      validate: true,
      tooltip: '',
    }
  },
  qcloud () {
    return {
      validate: true,
      tooltip: '',
    }
  },
  aws () {
    return {
      validate: true,
      tooltip: '',
    }
  },
  huawei () {
    return {
      validate: true,
      tooltip: '',
    }
  },
  azure () {
    return {
      validate: true,
      tooltip: '',
    }
  },
  ucloud (obj) {
    const diskType = 'data'
    const provider = obj.provider
    const notInStorageType = ['CLOUD_NORMAL']
    if (notInStorageType.includes(obj.storage_type)) {
      return {
        validate: false,
        tooltip: `${PROVIDER_MAP[provider].label}磁盘在磁盘存储类型为【${_tran(notInStorageType, ALL_STORAGE_LABEL)}】下不可以进行该操作`,
      }
    }
    if (obj.disk_type !== diskType) {
      return {
        validate: false,
        tooltip: `${PROVIDER_MAP[provider].label}磁盘仅在磁盘类型为【${DISK_TYPES[obj.disk_type]}】下可以进行该操作`,
      }
    }
    return {
      validate: true,
      tooltip: '',
    }
  },
  google () {
    return {
      validate: true,
      tooltip: '',
    }
  },
  ctyun () {
    return {
      validate: false,
      tooltip: '天翼云暂不支持此操作',
    }
  },
}
