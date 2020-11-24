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
  rebuildRoot: {
    cn: i18n.t('compute.text_357'),
    brand: {
      azure: ['ready', 'running'],
      qcloud: ['ready', 'running'],
      aliyun: ['ready', 'running'],
      aws: ['ready', 'running'],
      onecloud: ['ready', 'running'],
      vmware: ['ready'],
      baremetal: ['ready'],
      huawei: ['ready', 'rebuild_root_fail'],
      openstack: ['ready'],
      zstack: ['ready'],
      dstack: ['ready'],
      ucloud: ['ready'],
      ctyun: ['ready'],
      google: ['ready'],
      apsara: ['running', 'ready'],
    },
  },
  resetPassword: {
    cn: i18n.t('compute.text_276'),
    brand: {
      azure: ['running'],
      qcloud: ['ready'],
      aliyun: ['ready'],
      aws: false,
      onecloud: ['ready'],
      vmware: ['ready'],
      baremetal: ['ready', 'admin'],
      huawei: ['ready'],
      openstack: ['running'],
      zstack: ['running'],
      dstack: ['running'],
      ucloud: ['ready'],
      ctyun: ['ready'],
      google: ['ready'],
      apsara: ['running'],
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
      vmware: ['ready'],
      baremetal: ['ready', 'admin'],
      huawei: false,
      openstack: ['running'],
      zstack: ['running'],
      dstack: ['running'],
      ucloud: false,
      ctyun: false,
      google: ['ready'],
      apsara: ['running'],
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
      vmware: ['ready'],
      baremetal: ['ready', 'admin'],
      huawei: false,
      openstack: ['running'],
      zstack: ['running'],
      dstack: ['running'],
      ucloud: false,
      ctyun: false,
      google: ['ready'],
      apsara: ['running'],
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
      vmware: ['ready'],
      baremetal: false,
      huawei: ['ready'],
      openstack: ['ready', 'running'],
      zstack: ['ready'],
      dstack: ['ready'],
      ucloud: ['ready'],
      ctyun: ['ready'],
      google: ['ready'],
      apsara: ['ready'],
    },
  },
  vnc: {
    cn: 'vnc',
    brand: {
      azure: false,
      qcloud: ['running'],
      aliyun: ['running'],
      aws: false,
      onecloud: ['running', 'block_stream'],
      vmware: ['running'],
      baremetal: false,
      huawei: false,
      openstack: ['running'],
      zstack: ['running'],
      dstack: ['running'],
      ucloud: false,
      ctyun: false,
      google: false,
      apsara: ['running'],
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
      vmware: ['running'],
      baremetal: ['running'],
      huawei: ['running'],
      openstack: ['running'],
      zstack: ['running'],
      dstack: ['running'],
      ucloud: ['running'],
      ctyun: ['running'],
      google: ['running'],
      apsara: ['running'],
    },
  },
  'IP SSH': {
    cn: 'IP SSH',
    brand: {
      azure: false, // 暂时网络未打通
      qcloud: false, // 暂时网络未打通
      aliyun: false, // 暂时网络未打通
      aws: false, // 暂时网络未打通
      onecloud: ['running', 'block_stream'],
      vmware: ['running'],
      baremetal: ['running'],
      huawei: false, // 暂时网络未打通
      openstack: ['running'],
      zstack: false,
      dstack: false,
      ucloud: false,
      ctyun: false,
      google: false,
      apsara: false,
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
      vmware: ['running', 'ready'],
      baremetal: ['running', 'ready'],
      huawei: ['running', 'ready'],
      openstack: ['running', 'ready'],
      zstack: ['running', 'ready'],
      dstack: ['running', 'ready'],
      ucloud: false,
      ctyun: false,
      google: ['running', 'ready'],
      apsara: false,
    },
  },
  transfer: {
    cn: i18n.t('compute.text_1127'),
    brand: {
      azure: false,
      qcloud: false,
      aliyun: false,
      aws: false,
      onecloud: ['running', 'ready', 'unknown'],
      vmware: false,
      baremetal: false,
      huawei: false,
      openstack: false,
      zstack: false,
      dstack: false,
      ucloud: false,
      ctyun: false,
      google: false,
      apsara: false,
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
      vmware: false,
      baremetal: true,
      huawei: true,
      openstack: true,
      zstack: true,
      dstack: true,
      ucloud: true,
      ctyun: true,
      google: true,
      apsara: false,
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
      vmware: false,
      baremetal: true,
      huawei: true,
      openstack: false,
      zstack: false,
      dstack: false,
      ucloud: false,
      ctyun: false,
      google: false,
      apsara: false,
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
      vmware: false,
      baremetal: true,
      huawei: true,
      openstack: true,
      zstack: false,
      dstack: false,
      ucloud: false,
      ctyun: false,
      google: false,
      apsara: false,
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
      vmware: false,
      baremetal: false,
      huawei: ['running', 'ready'],
      openstack: ['running', 'ready'],
      zstack: ['running', 'ready'],
      dstack: ['running', 'ready'],
      ucloud: ['running', 'ready'],
      ctyun: ['running', 'ready'],
      google: ['running', 'ready'],
      apsara: false,
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
      vmware: false,
      baremetal: false,
      huawei: ['running', 'ready'],
      openstack: ['running', 'ready'],
      zstack: ['running', 'ready'],
      dstack: ['running', 'ready'],
      ucloud: ['running', 'ready'],
      ctyun: ['running', 'ready'],
      google: ['running', 'ready'],
      apsara: false,
    },
  },
  acttachGpu: {
    cn: i18n.t('compute.text_1304'),
    brand: {
      onecloud: ['ready'],
      vmware: false,
    },
  },
  publicIpToEip: {
    cn: i18n.t('compute.text_1305'),
    brand: {
      qcloud: ['running', 'ready'],
      aliyun: ['running', 'ready'],
      google: false,
      aws: false,
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
