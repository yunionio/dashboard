import { status } from '@/locales/zh-CN'
import { typeClouds } from '@/utils/common/hypervisor'

const hypervisorMap = typeClouds.hypervisorMap

const serverStatus = status.server

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
  'rebuildRoot': {
    cn: '重装系统',
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
    },
  },
  'resetPassword': {
    cn: '重置密码',
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
    },
  },
  'bindKeyPair': {
    cn: '绑定密钥',
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
    },
  },
  'unBindKeyPair': {
    cn: '解绑密钥',
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
    },
  },
  'adjustConfig': {
    cn: '调整配置',
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
    },
  },
  'vnc': {
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
    },
  },
  'EIP SSH': {
    cn: 'EIP SSH',
    brand: {
      azure: ['running'],
      qcloud: ['running'],
      aliyun: ['running'],
      aws: ['running'],
      onecloud: false,
      vmware: false,
      baremetal: false,
      huawei: ['running'],
      openstack: ['running'],
      zstack: ['running'],
      dstack: ['running'],
      ucloud: ['running'],
      ctyun: ['running'],
      google: ['running'],
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
    },
  },
  'createSnapshot': {
    cn: '创建快照',
    brand: {
      azure: ['running', 'ready'],
      qcloud: ['running', 'ready'],
      aliyun: ['running', 'ready'],
      aws: ['running', 'ready'],
      onecloud: ['running', 'ready'],
      vmware: false,
      baremetal: ['running', 'ready'],
      huawei: ['running', 'ready'],
      openstack: ['running', 'ready'],
      zstack: ['running', 'ready'],
      dstack: ['running', 'ready'],
      ucloud: false,
      ctyun: false,
      google: ['running', 'ready'],
    },
  },
  'transfer': {
    cn: '迁移',
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
    },
  },
  'assignSecgroup': {
    cn: '关联安全组',
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
    },
  },
  'insertiso': {
    cn: '挂载ISO',
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
    },
  },
  'ejectiso': {
    cn: '卸载ISO',
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
    },
  },
  'bindEip': {
    cn: '绑定EIP',
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
    },
  },
  'unbindEip': {
    cn: '解绑EIP',
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
    },
  },
  'acttachGpu': {
    cn: '绑定GPU卡',
    brand: {
      onecloud: ['ready'],
      vmware: false,
    },
  },
  'publicIpToEip': {
    cn: '公有IP转EIP',
    brand: {
      qcloud: ['running', 'ready'],
      aliyun: ['running', 'ready'],
      google: false,
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
    return `仅状态为【${_tran(statusArr)}】的机器进行操作`
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
  if (!value || !value.length) return '请先选择要操作的机器'
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
        errorMsg = '请关机后操作'
        return false
      }
    } else if (Array.isArray(actionItem[H])) { // 是 actionEnableMap 中的一种，且状态是数组
      if (actionItem[H].includes(obj.status)) {
        return true
      } else {
        errorMsg = `仅在云服务器状态为【${_tran(actionItem[H])}】下可以进行该操作`
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
        const tooltip = hypervisorMap[H]['label']
        errorMsg = `${tooltip}暂不支持该操作`
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
