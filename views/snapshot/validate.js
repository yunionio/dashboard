import status from '@/locales/zh-CN'
import { BRAND_MAP } from '@/constants'
import { typeClouds } from '@/utils/common/hypervisor'
import i18n from '@/locales'

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
      ret.tooltip = i18n.t('compute.text_1062')
      return ret
    }
    const supportBrands = [
      typeClouds.hypervisorMap.aliyun.brand,
      typeClouds.hypervisorMap.qcloud.brand,
      typeClouds.hypervisorMap.azure.brand,
      typeClouds.hypervisorMap.aws.brand,
      typeClouds.hypervisorMap.huawei.brand,
      typeClouds.hypervisorMap.ucloud.brand,
      typeClouds.hypervisorMap.apsara.brand,
    ]
    if (!supportBrands.includes(obj.brand)) {
      if (!obj.guest) {
        ret.tooltip = i18n.t('compute.text_1073')
        return ret
      }
      if (obj.guest_status && obj.guest_status !== 'ready') {
        ret.tooltip = i18n.t('compute.text_1074')
        return ret
      }
      if (obj.disk_status && obj.disk_status !== 'ready') {
        ret.tooltip = i18n.t('compute.text_1075')
        return ret
      }
    }
    const status = ['ready']
    ret.validate = status.includes(obj.status)
    ret.tooltip = ret.validate ? '' : i18n.t('compute.text_1076', [_tran(status)])
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
      tooltip: i18n.t('compute.text_1077', [BRAND_MAP[obj.brand].label]),
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
      ret.tooltip = i18n.t('compute.text_1078', [BRAND_MAP[obj.brand].label])
    }
    return ret
  },
  qcloud (obj) {
    const ret = RollbackDiskValidate.base(obj)
    if (obj.guest && obj.guest_status !== 'ready') {
      ret.validate = false
      ret.tooltip = i18n.t('compute.text_1078', [BRAND_MAP[obj.brand].label])
    }
    return ret
  },
  aws (obj) {
    const ret = { validate: false }
    ret.tooltip = i18n.t('compute.text_1077', [BRAND_MAP[obj.brand].label])
    return ret
  },
  huawei (obj) {
    const ret = RollbackDiskValidate.base(obj)
    if (obj.guest) {
      ret.validate = false
      ret.tooltip = i18n.t('compute.text_1079', [BRAND_MAP[obj.brand].label])
    }
    return ret
  },
  azure (obj) {
    const ret = { validate: false }
    ret.tooltip = i18n.t('compute.text_1077', [BRAND_MAP[obj.brand].label])
    return ret
  },
  ucloud (obj) {
    const ret = RollbackDiskValidate.base(obj)
    if (obj.guest) {
      ret.validate = false
      ret.tooltip = i18n.t('compute.text_1079', [BRAND_MAP[obj.brand].label])
      return ret
    }
    if (obj.disk_type !== 'data') {
      ret.validate = false
      ret.tooltip = i18n.t('compute.text_1080', [BRAND_MAP[obj.brand].label])
      return ret
    }
    return ret
  },
  google (obj) {
    const ret = { validate: false }
    ret.tooltip = i18n.t('compute.text_1077', [BRAND_MAP[obj.brand].label])
    return ret
  },
}
