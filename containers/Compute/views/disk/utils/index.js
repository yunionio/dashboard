import { DISK_TYPES, ALL_STORAGE_LABEL } from '../../../constants'
import status from '@/locales/zh-CN'
import { PROVIDER_MAP } from '@/constants'
import i18n from '@/locales'
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
      tooltip: validate ? '' : i18n.t('compute.text_465', [_tran(status)]),
    }
  },
  vmware (obj) {
    const { validate, tooltip } = diskResizeConfig.base(obj)
    if (!validate) {
      return {
        validate: false,
        tooltip,
      }
    }
    if (obj.disk_type === 'data') { // 数据盘
      const validate = obj.guest_status === 'running' || obj.guest_status === 'ready' // 开机关机均可以扩容
      const tooltip = validate ? '' : i18n.t('compute.text_1349', [_tran(['running', 'ready'], serverStatus)])
      return {
        validate,
        tooltip,
      }
    } else { // 系统盘
      const validate = obj.guest_status === 'ready' // 关机可以扩容
      const tooltip = validate ? '' : i18n.t('compute.text_1349', [_tran(['ready'], serverStatus)])
      return {
        validate,
        tooltip,
      }
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
        tooltip: i18n.t('compute.text_467', [PROVIDER_MAP[provider].label]),
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
    const { validate, tooltip } = diskResizeConfig.base(obj)
    if (!validate) {
      return {
        validate: false,
        tooltip,
      }
    }
    if (obj.guest_status === 'running') {
      return {
        validate: false,
        tooltip: i18n.t('compute.text_468', [PROVIDER_MAP[provider].label]),
      }
    }
    if (obj.disk_type !== diskType) {
      return {
        validate: false,
        tooltip: i18n.t('compute.text_466', [PROVIDER_MAP[provider].label, DISK_TYPES[diskType]]),
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
        tooltip: i18n.t('compute.text_469', [PROVIDER_MAP[provider].label, _tran(guestStatus, serverStatus)]),
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
        tooltip: i18n.t('compute.text_469', [PROVIDER_MAP[provider].label, _tran(guestStatus, serverStatus)]),
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
        tooltip: i18n.t('compute.text_466', [PROVIDER_MAP[provider].label, DISK_TYPES[diskType]]),
      }
    }
    if (!storageType.includes(obj.storage_type)) {
      return {
        validate: false,
        tooltip: i18n.t('compute.text_470', [PROVIDER_MAP[provider].label, _tran(storageType, ALL_STORAGE_LABEL)]),
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
        tooltip: i18n.t('compute.text_469', [PROVIDER_MAP[provider].label, _tran(guestStatus, serverStatus)]),
      }
    }
    if (obj.disk_type !== diskType) {
      return {
        validate: false,
        tooltip: i18n.t('compute.text_466', [PROVIDER_MAP[provider].label, DISK_TYPES[diskType]]),
      }
    }
    if (notInStorageType.includes(obj.storage_type)) {
      return {
        validate: false,
        tooltip: i18n.t('compute.text_471', [PROVIDER_MAP[provider].label, _tran(notInStorageType, ALL_STORAGE_LABEL)]),
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
      tooltip: azureValid ? '' : i18n.t('compute.text_469', [PROVIDER_MAP[provider].label, _tran(guestStatus, serverStatus)]),
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
        tooltip: i18n.t('compute.text_466', [PROVIDER_MAP[provider].label, DISK_TYPES[diskType]]),
      }
    }
    if (obj.guest) {
      return {
        validate: false,
        tooltip: i18n.t('compute.text_472'),
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
      tooltip: i18n.t('compute.text_473', [PROVIDER_MAP[provider].label]),
    }
  },
  onecloud (obj) {
    const provider = obj.provider
    const guestStatus = ['ready', 'running']
    if (obj.guest && !guestStatus.includes(obj.guest_status)) {
      return {
        validate: false,
        tooltip: i18n.t('compute.text_474', [PROVIDER_MAP[provider].label, _tran(guestStatus, serverStatus)]),
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
        tooltip: i18n.t('compute.text_475', [PROVIDER_MAP[provider].label]),
      }
    }
    if (obj.guest_status && !guestStatus.includes(obj.guest_status)) {
      return {
        validate: false,
        tooltip: i18n.t('compute.text_469', [PROVIDER_MAP[provider].label, _tran(guestStatus, serverStatus)]),
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
        tooltip: i18n.t('compute.text_469', [PROVIDER_MAP[provider].label, _tran(guestStatus, serverStatus)]),
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
        tooltip: i18n.t('compute.text_469', [PROVIDER_MAP[provider].label, _tran(guestStatus, serverStatus)]),
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
        tooltip: i18n.t('compute.text_469', [PROVIDER_MAP[provider].label, _tran(guestStatus, serverStatus)]),
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
        tooltip: i18n.t('compute.text_471', [PROVIDER_MAP[provider].label, _tran(notInStorageType, ALL_STORAGE_LABEL)]),
      }
    }
    if (obj.disk_type !== diskType) {
      return {
        validate: false,
        tooltip: i18n.t('compute.text_466', [PROVIDER_MAP[provider].label, DISK_TYPES[obj.disk_type]]),
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
      tooltip: i18n.t('compute.text_476'),
    }
  },
}
