import { typeClouds } from '@/utils/common/hypervisor'
import i18n from '@/locales'

const hypervisorMap = typeClouds.hypervisorMap

const serverStatus = i18n.t('status.server')

const _toArr = value => {
  if (!Array.isArray(value)) {
    value = [value]
  }
  return value
}

const _tran = enArr => {
  return enArr.map(v => serverStatus[v] || v).filter(v => v).join('，')
}

const actionEableMap = {
  start: {
    cn: i18n.t('compute.text_272'),
    brand: {
      azure: ['ready'],
      qcloud: ['ready'],
      aliyun: ['ready'],
      aws: ['ready'],
      onecloud: ['ready'],
      cloudpods: ['ready'],
      vmware: ['ready'],
      baremetal: ['ready'],
      huawei: ['ready'],
      hcso: ['ready'],
      hcs: ['ready'],
      openstack: ['ready'],
      zstack: ['ready'],
      dstack: ['ready'],
      ucloud: ['ready'],
      ctyun: ['ready'],
      google: ['ready'],
      apsara: ['ready'],
      jdcloud: ['ready'],
      ecloud: ['ready'],
      nutanix: ['ready'],
      proxmox: ['ready'],
      bingocloud: false,
      incloudsphere: ['ready'],
      volcengine: ['ready'],
      remotefile: false,
    },
  },
  stop: {
    cn: i18n.t('compute.text_273'),
    brand: {
      azure: ['running'],
      qcloud: ['running'],
      aliyun: ['running'],
      aws: ['running'],
      onecloud: ['running'],
      cloudpods: ['running'],
      vmware: ['running'],
      baremetal: ['running'],
      huawei: ['running'],
      hcso: ['running'],
      hcs: ['running'],
      openstack: ['running'],
      zstack: ['running'],
      dstack: ['running'],
      ucloud: ['running'],
      ctyun: ['running'],
      google: ['running'],
      apsara: ['running'],
      jdcloud: ['running'],
      ecloud: ['running'],
      nutanix: ['running'],
      proxmox: ['running'],
      bingocloud: false,
      incloudsphere: ['running'],
      remotefile: false,
      volcengine: ['running'],
    },
  },
  restart: {
    cn: i18n.t('compute.text_274'),
    brand: {
      azure: ['running', 'stop_fail'],
      qcloud: ['running', 'stop_fail'],
      aliyun: ['running', 'stop_fail'],
      aws: ['running', 'stop_fail'],
      onecloud: ['running', 'stop_fail'],
      cloudpods: ['running', 'stop_fail'],
      vmware: ['running', 'stop_fail'],
      baremetal: ['running', 'stop_fail'],
      huawei: ['running', 'stop_fail'],
      hcso: ['running', 'stop_fail'],
      hcs: ['running', 'stop_fail'],
      openstack: ['running', 'stop_fail'],
      zstack: ['running', 'stop_fail'],
      dstack: ['running', 'stop_fail'],
      ucloud: ['running', 'stop_fail'],
      ctyun: ['running', 'stop_fail'],
      google: ['running', 'stop_fail'],
      apsara: ['running', 'stop_fail'],
      jdcloud: ['running', 'stop_fail'],
      ecloud: ['running', 'stop_fail'],
      nutanix: ['running', 'stop_fail'],
      proxmox: ['running', 'stop_fail'],
      bingocloud: false,
      incloudsphere: ['running', 'stop_fail'],
      remotefile: false,
      volcengine: ['running', 'stop_fail'],
    },
  },
  rebuildRoot: {
    cn: i18n.t('compute.text_357'),
    brand: {
      azure: ['ready', 'running'],
      qcloud: ['ready', 'running'],
      aliyun: ['ready', 'running'],
      aws: ['ready', 'running'],
      onecloud: ['ready'],
      cloudpods: ['ready'],
      vmware: ['ready'],
      baremetal: ['ready', 'admin'],
      huawei: ['ready', 'rebuild_root_fail'],
      hcso: ['ready', 'rebuild_root_fail'],
      hcs: ['ready', 'rebuild_root_fail'],
      openstack: ['ready'],
      zstack: ['ready'],
      dstack: ['ready'],
      ucloud: ['ready'],
      ctyun: ['ready'],
      google: ['ready'],
      apsara: ['running', 'ready'],
      proxmox: false,
      nutanix: false,
      bingocloud: false,
      incloudsphere: false,
      remotefile: false,
      volcengine: false,
    },
  },
  resetPassword: {
    cn: i18n.t('compute.text_276'),
    brand: {
      azure: ['running'],
      qcloud: ['ready'],
      aliyun: ['ready'],
      aws: false,
      onecloud: ['running', 'ready'],
      cloudpods: ['ready'],
      vmware: ['ready'],
      baremetal: ['ready', 'admin'],
      huawei: ['ready'],
      hcso: ['ready'],
      hcs: ['ready'],
      openstack: ['running'],
      zstack: ['running'],
      dstack: ['running'],
      ucloud: ['ready'],
      ctyun: ['running'],
      google: ['ready'],
      apsara: ['running'],
      proxmox: false,
      nutanix: false,
      bingocloud: false,
      incloudsphere: ['running'],
      remotefile: false,
      volcengine: ['ready'],
    },
  },
  bindKeyPair: {
    cn: i18n.t('compute.text_361'),
    brand: {
      azure: ['running'],
      qcloud: ['ready'],
      aliyun: ['ready'],
      aws: false,
      onecloud: ['ready'],
      cloudpods: ['ready'],
      vmware: ['ready'],
      baremetal: ['ready', 'admin'],
      huawei: false,
      hcso: false,
      hcs: false,
      openstack: ['running'],
      zstack: ['running'],
      dstack: ['running'],
      ucloud: false,
      ctyun: ['ready', 'running'],
      google: ['ready'],
      apsara: ['running'],
      proxmox: false,
      nutanix: false,
      bingocloud: false,
      incloudsphere: ['running'],
      remotefile: false,
      volcengine: ['ready'],
    },
  },
  unBindKeyPair: {
    cn: i18n.t('compute.text_364'),
    brand: {
      azure: ['running'],
      qcloud: ['ready'],
      aliyun: ['ready'],
      aws: false,
      onecloud: ['ready'],
      cloudpods: ['ready'],
      vmware: ['ready'],
      baremetal: ['ready', 'admin'],
      huawei: false,
      hcso: false,
      hcs: false,
      openstack: ['running'],
      zstack: ['running'],
      dstack: ['running'],
      ucloud: false,
      ctyun: ['ready', 'running'],
      google: ['ready'],
      apsara: ['running'],
      proxmox: false,
      nutanix: false,
      bingocloud: false,
      incloudsphere: false,
      remotefile: false,
      volcengine: ['ready'],
    },
  },
  adjustConfig: {
    cn: i18n.t('compute.text_1100'),
    brand: {
      azure: ['ready', 'running'],
      qcloud: ['ready'],
      aliyun: ['ready'],
      aws: ['ready'],
      onecloud: ['ready', 'running'],
      cloudpods: ['ready', 'running'],
      vmware: ['ready', 'running'],
      baremetal: false,
      huawei: ['ready'],
      hcso: ['ready'],
      hcs: ['ready'],
      openstack: ['ready', 'running'],
      zstack: ['ready'],
      dstack: ['ready'],
      ucloud: ['ready'],
      ctyun: ['ready'],
      google: ['ready'],
      apsara: ['ready'],
      nutanix: ['ready'],
      proxmox: ['ready', 'running'],
      bingocloud: false,
      incloudsphere: ['ready', 'running'],
      remotefile: false,
      volcengine: ['ready'],
    },
  },
  vnc: {
    cn: 'vnc',
    brand: {
      azure: false,
      qcloud: ['running'],
      aliyun: ['running'],
      aws: false,
      onecloud: ['running', 'block_stream', 'live_migrating'],
      cloudpods: ['running'],
      vmware: ['running'],
      baremetal: false,
      huawei: ['running'],
      hcso: ['running'],
      hcs: ['running'],
      openstack: ['running'],
      zstack: ['running'],
      dstack: ['running'],
      ucloud: false,
      ctyun: ['running'],
      google: false,
      apsara: ['running'],
      jdcloud: ['running'],
      ecloud: ['running'],
      proxmox: ['running'],
      nutanix: false,
      bingocloud: false,
      incloudsphere: ['running'],
      remotefile: false,
      volcengine: ['running'],
    },
  },
  'EIP SSH': {
    cn: 'EIP SSH',
    brand: {
      azure: ['running'],
      qcloud: ['running'],
      aliyun: ['running'],
      aws: ['running'],
      onecloud: ['running'],
      cloudpods: ['running'],
      vmware: ['running'],
      baremetal: ['running'],
      huawei: ['running'],
      hcso: ['running'],
      hcs: ['running'],
      openstack: ['running'],
      zstack: ['running'],
      dstack: ['running'],
      ucloud: ['running'],
      ctyun: ['running'],
      google: ['running'],
      apsara: ['running'],
      jdcloud: ['running'],
      ecloud: ['running'],
      nutanix: ['running'],
      proxmox: false,
      bingocloud: false,
      remotefile: false,
      volcengine: ['running'],
    },
  },
  'IP SSH': {
    cn: 'IP SSH',
    brand: {
      azure: false, // 暂时网络未打通
      qcloud: false, // 暂时网络未打通
      aliyun: false, // 暂时网络未打通
      aws: false, // 暂时网络未打通
      onecloud: ['running'],
      cloudpods: ['running'],
      vmware: ['running'],
      baremetal: ['running'],
      huawei: false, // 暂时网络未打通
      hcso: false, // 暂时网络未打通
      hcs: false, // 暂时网络未打通
      openstack: ['running'],
      zstack: false,
      dstack: false,
      ucloud: false,
      ctyun: false,
      google: false,
      apsara: false,
      jdcloud: false,
      ecloud: false,
      nutanix: ['running'],
      bingocloud: false,
      incloudsphere: ['running'],
      proxmox: false,
      remotefile: false,
      volcengine: ['running'],
    },
  },
  createSnapshot: {
    cn: i18n.t('compute.text_1276'),
    brand: {
      azure: ['running', 'ready'],
      qcloud: ['running', 'ready'],
      aliyun: ['running', 'ready'],
      aws: ['running', 'ready'],
      onecloud: ['running', 'ready'],
      cloudpods: ['running', 'ready'],
      vmware: ['running', 'ready'],
      baremetal: ['running', 'ready'],
      huawei: ['running', 'ready'],
      hcso: ['running', 'ready'],
      hcs: ['running', 'ready'],
      openstack: ['running', 'ready'],
      zstack: ['running', 'ready'],
      dstack: ['running', 'ready'],
      ucloud: false,
      ctyun: false,
      google: ['running', 'ready'],
      apsara: false,
      proxmox: false,
      nutanix: false,
      bingocloud: false,
      incloudsphere: false,
      remotefile: false,
      volcengine: false,
    },
  },
  createBackup: {
    cn: i18n.t('compute.text_1276'),
    brand: {
      azure: false,
      qcloud: false,
      aliyun: false,
      aws: false,
      onecloud: ['running', 'ready'],
      cloudpods: false,
      vmware: false,
      baremetal: false,
      huawei: false,
      hcso: false,
      hcs: false,
      openstack: false,
      zstack: false,
      dstack: false,
      ucloud: false,
      ctyun: false,
      google: false,
      apsara: false,
      nutanix: false,
      bingocloud: false,
      proxmox: false,
      incloudsphere: false,
      remotefile: false,
      volcengine: false,
    },
  },
  transfer: {
    cn: i18n.t('compute.text_1127'),
    brand: {
      azure: false,
      qcloud: false,
      aliyun: false,
      aws: false,
      onecloud: ['running', 'ready'],
      cloudpods: ['running', 'ready'],
      vmware: ['running', 'ready'],
      baremetal: false,
      huawei: false,
      hcso: false,
      hcs: false,
      openstack: true,
      zstack: false,
      dstack: false,
      ucloud: false,
      ctyun: false,
      google: false,
      apsara: false,
      nutanix: false,
      proxmox: false,
      bingocloud: false,
      incloudsphere: false,
      remotefile: false,
      volcengine: false,
    },
  },
  v2vTransfer: {
    cn: i18n.t('compute.v2vtransfer.label'),
    brand: {
      azure: false,
      qcloud: false,
      aliyun: false,
      aws: false,
      onecloud: false,
      cloudpods: ['ready'],
      vmware: ['ready'],
      baremetal: false,
      huawei: false,
      hcso: false,
      hcs: false,
      openstack: false,
      zstack: false,
      dstack: false,
      ucloud: false,
      ctyun: false,
      google: false,
      apsara: false,
      proxmox: false,
      nutanix: false,
      bingocloud: false,
      incloudsphere: false,
      remotefile: false,
      volcengine: false,
    },
  },
  assignSecgroup: {
    cn: i18n.t('compute.text_1116'),
    brand: {
      azure: true,
      qcloud: true,
      aliyun: true,
      aws: true,
      onecloud: true,
      cloudpods: true,
      vmware: false,
      baremetal: true,
      huawei: true,
      hcso: true,
      hcs: true,
      openstack: true,
      zstack: true,
      dstack: true,
      ucloud: true,
      ctyun: true,
      google: true,
      apsara: false,
      proxmox: false,
      nutanix: false,
      bingocloud: false,
      incloudsphere: false,
      remotefile: false,
      volcengine: true,
    },
  },
  insertiso: {
    cn: i18n.t('compute.text_366'),
    brand: {
      azure: true,
      qcloud: true,
      aliyun: true,
      aws: true,
      onecloud: true,
      vmware: true,
      baremetal: true,
      huawei: true,
      hcso: true,
      hcs: true,
      openstack: false,
      zstack: false,
      dstack: false,
      ucloud: false,
      ctyun: false,
      google: false,
      apsara: false,
      proxmox: false,
      nutanix: false,
      bingocloud: false,
      incloudsphere: false,
      remotefile: false,
      volcengine: false,
    },
  },
  ejectiso: {
    cn: i18n.t('compute.text_367'),
    brand: {
      azure: true,
      qcloud: true,
      aliyun: true,
      aws: true,
      onecloud: true,
      vmware: true,
      baremetal: true,
      huawei: true,
      hcso: true,
      hcs: true,
      openstack: true,
      zstack: false,
      dstack: false,
      ucloud: false,
      ctyun: false,
      google: false,
      apsara: false,
      proxmox: false,
      nutanix: false,
      bingocloud: false,
      incloudsphere: false,
      remotefile: false,
      volcengine: false,
    },
  },
  bindEip: {
    cn: i18n.t('compute.text_1302'),
    brand: {
      azure: ['running', 'ready'],
      qcloud: ['running', 'ready'],
      aliyun: ['running', 'ready'],
      aws: ['running', 'ready'],
      onecloud: ['running', 'ready'],
      cloudpods: ['running', 'ready'],
      vmware: false,
      baremetal: false,
      huawei: ['running', 'ready'],
      hcso: ['running', 'ready'],
      hcs: ['running', 'ready'],
      openstack: ['running', 'ready'],
      zstack: ['running', 'ready'],
      dstack: ['running', 'ready'],
      ucloud: ['running', 'ready'],
      ctyun: ['running', 'ready'],
      google: ['running', 'ready'],
      apsara: false,
      proxmox: false,
      nutanix: false,
      bingocloud: false,
      incloudsphere: false,
      remotefile: false,
      volcengine: ['running', 'ready'],
    },
  },
  unbindEip: {
    cn: i18n.t('compute.text_1303'),
    brand: {
      azure: ['running', 'ready'],
      qcloud: ['running', 'ready'],
      aliyun: ['running', 'ready'],
      aws: ['running', 'ready'],
      onecloud: ['running', 'ready'],
      cloudpods: ['running', 'ready'],
      vmware: false,
      baremetal: false,
      huawei: ['running', 'ready'],
      hcso: ['running', 'ready'],
      hcs: ['running', 'ready'],
      openstack: ['running', 'ready'],
      zstack: ['running', 'ready'],
      dstack: ['running', 'ready'],
      ucloud: ['running', 'ready'],
      ctyun: ['running', 'ready'],
      google: ['running', 'ready'],
      apsara: false,
      nutanix: false,
      proxmox: false,
      bingocloud: false,
      incloudsphere: false,
      remotefile: false,
      volcengine: ['running', 'ready'],
    },
  },
  acttachGpu: {
    cn: i18n.t('compute.text_1304'),
    brand: {
      onecloud: ['ready'],
      vmware: false,
      bingocloud: false,
      incloudsphere: false,
      remotefile: false,
      volcengine: false,
    },
  },
  acttachUsb: {
    cn: i18n.t('compute.text_1399'),
    brand: {
      onecloud: ['ready', 'running'],
      vmware: false,
      bingocloud: false,
      incloudsphere: false,
      remotefile: false,
      volcengine: false,
    },
  },
  publicIpToEip: {
    cn: i18n.t('compute.text_1305'),
    brand: {
      qcloud: ['running', 'ready'],
      aliyun: ['running', 'ready'],
      google: false,
      aws: false,
      bingocloud: false,
      incloudsphere: false,
      remotefile: false,
      volcengine: false,
    },
  },
  changeBlockStorage: {
    cn: i18n.t('compute.vminstance.change_disk_storage'),
    brand: {
      onecloud: ['ready', 'running'],
      remotefile: false,
      volcengine: false,
    },
  },
  addBackup: {
    cn: i18n.t('compute.text_1162'),
    brand: {
      onecloud: ['ready'],
      volcengine: false,
    },
  },
}

export const commonEnabled = (value, statusArr = ['ready']) => {
  return statusArr.includes(value.status)
}

export const commonTip = (obj, statusArr = ['ready']) => {
  if (statusArr.includes(obj.status)) {
    return null
  } else {
    return i18n.t('compute.text_1306', [_tran(statusArr)])
  }
}

export const commonUnabled = (value, statusArr = ['sched_fail', 'net_fail', 'disk_fail']) => {
  return statusArr.includes(value.status)
}

export const cloudEnabled = (action, value, othersEabledStatus = ['ready']) => {
  value = _toArr(value)
  if (!value || !value.length) return false
  const actionItem = actionEableMap[action] && actionEableMap[action].brand
  return value.every(obj => {
    let H = obj.brand ? obj.brand.toLowerCase() : obj.hypervisor.toLowerCase() // 兼容没有brand的情况
    if (H === 'kvm') H = 'onecloud' // 兼容没有brand的情况
    if (H === 'esxi') H = 'vmware' // 兼容没有brand的情况
    if (actionItem === undefined) { // 不是 actionEnableMap 中的一种
      return commonEnabled(obj)
    } else if (Array.isArray(actionItem[H])) { // 是 actionEnableMap 中的一种，且状态是数组
      return actionItem[H].includes(obj.status)
    } else if (actionItem[H] === undefined) { // 新接入的平台
      return commonEnabled(obj)
    } else { // 是 actionEnableMap 中的一种，且状态是 boolean
      if (actionItem[H] === true) {
        return true
      } else if (actionItem[H] === undefined) { // 且不是 aliyun、azure、qcloud、aws 的一种
        return commonEnabled(obj, othersEabledStatus)
      } else {
        return false
      }
    }
  })
}

export const cloudUnabledTip = (action, value, othersEabledStatus = ['ready']) => {
  value = _toArr(value)
  if (!value || !value.length) return i18n.t('compute.text_1307')
  let errorMsg = null
  const actionItem = actionEableMap[action] && actionEableMap[action].brand
  const valid = value.every(obj => {
    let H = obj.brand ? obj.brand.toLowerCase() : obj.hypervisor.toLowerCase() // 兼容没有brand的情况
    if (H === 'kvm') H = 'onecloud' // 兼容没有brand的情况
    if (H === 'esxi') H = 'vmware' // 兼容没有brand的情况
    if (actionItem === undefined) { // 不是 actionEnableMap 中的一种
      if (commonEnabled(obj)) {
        return true
      } else {
        errorMsg = i18n.t('compute.text_1308')
        return false
      }
    } else if (Array.isArray(actionItem[H])) { // 是 actionEnableMap 中的一种，且状态是数组
      if (actionItem[H].includes(obj.status)) {
        return true
      } else {
        errorMsg = i18n.t('compute.text_1309', [_tran(actionItem[H])])
        return false
      }
    } else if (actionItem[H] === undefined) { // 新接入的平台
      if (commonEnabled(obj)) {
        return true
      } else {
        errorMsg = commonTip(obj, othersEabledStatus)
        return false
      }
    } else { // 是 actionEnableMap 中的一种，且状态是 boolean
      if (actionItem[H] === true) {
        return true
      } else if (actionItem[H] === undefined) { // 且不是 aliyun、azure、qcloud、aws 的一种
        errorMsg = commonTip(obj, othersEabledStatus)
        return false
      } else {
        if (H === 'onecloud') H = 'kvm'
        if (H === 'vmware') H = 'esxi'
        const tooltip = hypervisorMap[H].label
        errorMsg = i18n.t('compute.text_1287', [tooltip])
        return false
      }
    }
  })
  if (valid) {
    return null
  } else {
    return errorMsg
  }
}

export const isSameDate = (date1, date2) => {
  let isSame = true
  if (date1.getFullYear() !== date2.getFullYear()) {
    isSame = false
  }
  if (date1.getMonth() !== date2.getMonth()) {
    isSame = false
  }
  if (date1.getDate() !== date2.getDate()) {
    isSame = false
  }
  return isSame
}

export const validateRescueMode = (val) => {
  const ret = { validate: true }
  if (Array.isArray(val)) {
    const isSomeRescueMode = val.some(item => item.rescue_mode === true)
    if (isSomeRescueMode) {
      ret.validate = false
      ret.tooltip = i18n.t('compute.start_rescue.validate_tooltip')
    }
  } else {
    if (val?.rescue_mode === true) {
      ret.validate = false
      ret.tooltip = i18n.t('compute.start_rescue.validate_tooltip')
    }
  }
  return ret
}
