import status from '@/locales/zh-CN'
import { BRAND_MAP } from '@/constants'
import { typeClouds } from '@/utils/common/hypervisor'

const { snapshot: snapshotStatus } = status.status
const _tran = (enArr, status = snapshotStatus) => {
  return enArr.map(v => status[v] || v).filter(v => v).join('，')
}

export const RollbackDiskValidate = {
  base (obj) {
    const ret = {
      validate: false,
      tooltip: null,
    }
    if (obj.is_sub_snapshot) {
      ret.tooltip = '此快照为主机快照子快照，不可操作'
      return ret
    }
    const supportBrands = [
      typeClouds.hypervisorMap.aliyun.brand,
      typeClouds.hypervisorMap.qcloud.brand,
      typeClouds.hypervisorMap.azure.brand,
      typeClouds.hypervisorMap.aws.brand,
      typeClouds.hypervisorMap.huawei.brand,
      typeClouds.hypervisorMap.ucloud.brand,
    ]
    if (!supportBrands.includes(obj.brand)) {
      if (!obj.guest) {
        ret.tooltip = '请选择有虚拟机的快照'
        return ret
      }
      if (obj.guest_status && obj.guest_status !== 'ready') {
        ret.tooltip = '请选择虚拟机状态为关机的快照'
        return ret
      }
      if (obj.disk_status && obj.disk_status !== 'ready') {
        ret.tooltip = '请选择磁盘状态为可用的快照'
        return ret
      }
    }
    const status = ['ready']
    ret.validate = status.includes(obj.status)
    ret.tooltip = ret.validate ? '' : `仅在快照状态为【${_tran(status)}】下可以进行该操作`
    return ret
  },
  vmware (obj) {
    const { validate, tooltip } = RollbackDiskValidate.base(obj)
    return { validate, tooltip }
  },
  onecloud (obj) {
    const { validate, tooltip } = RollbackDiskValidate.base(obj)
    return { validate, tooltip }
  },
  openstack (obj) {
    const ret = {
      validate: false,
      tooltip: `${BRAND_MAP[obj.brand].label}不支持快照回滚硬盘`,
    }
    return ret
  },
  zstack (obj) {
    const { validate, tooltip } = RollbackDiskValidate.base(obj)
    return { validate, tooltip }
  },
  dstack (obj) {
    const { validate, tooltip } = RollbackDiskValidate.base(obj)
    return { validate, tooltip }
  },
  aliyun (obj) {
    const ret = RollbackDiskValidate.base(obj)
    if (obj.guest && obj.guest_status !== 'ready') {
      ret.validate = false
      ret.tooltip = `${BRAND_MAP[obj.brand].label}只有硬盘为未挂载或者已挂载但是主机处于关机状态的快照才支持回滚`
    }
    return ret
  },
  qcloud (obj) {
    const ret = RollbackDiskValidate.base(obj)
    if (obj.guest && obj.guest_status !== 'ready') {
      ret.validate = false
      ret.tooltip = `${BRAND_MAP[obj.brand].label}只有硬盘为未挂载或者已挂载但是主机处于关机状态的快照才支持回滚`
    }
    return ret
  },
  aws (obj) {
    const ret = { validate: false }
    ret.tooltip = `${BRAND_MAP[obj.brand].label}不支持快照回滚硬盘`
    return ret
  },
  huawei (obj) {
    const ret = RollbackDiskValidate.base(obj)
    if (obj.guest) {
      ret.validate = false
      ret.tooltip = `${BRAND_MAP[obj.brand].label}请选择未挂载磁盘的快照`
    }
    return ret
  },
  azure (obj) {
    const ret = { validate: false }
    ret.tooltip = `${BRAND_MAP[obj.brand].label}不支持快照回滚硬盘`
  },
  ucloud (obj) {
    const ret = RollbackDiskValidate.base(obj)
    if (obj.guest) {
      ret.validate = false
      ret.tooltip = `${BRAND_MAP[obj.brand].label}请选择未挂载磁盘的快照`
      return ret
    }
    if (obj.disk_type !== 'data') {
      ret.validate = false
      ret.tooltip = `${BRAND_MAP[obj.brand].label}请选择硬盘类型为数据盘的快照`
      return ret
    }
    return ret
  },
}
