import { SERVER_TYPE } from '@Compute/constants'
import { findPlatform } from '@/utils/common/hypervisor'

export default {
  created () {
    const type = findPlatform(this.data.hypervisor)
    const isPublic = type === SERVER_TYPE.private
    const isPrivate = type === SERVER_TYPE.public
    this.singleActions = [
      {
        label: '修改带宽',
        action: (obj) => {
          this.createDialog('VmChangeBandwidthDialog', {
            data: [obj],
            columns: this.columns,
            refresh: this.refresh,
          })
        },
      },
      {
        label: '更换IP',
        action: (obj) => {
          this.createDialog('VmChangeIpDialog', {
            data: [obj],
            columns: this.columns,
            zone: this.data.zone_id,
            resId: this.resId,
            hypervisor: this.data.hypervisor,
            refresh: this.refresh,
          })
        },
        meta: (obj) => {
          const ret = {
            validate: false,
            tooltip: null,
          }
          if (isPrivate || isPublic) {
            ret.tooltip = '私有云、公有云不支持此操作'
            return ret
          }
          ret.validate = true
          return ret
        },
      },
    ]
  },
}
