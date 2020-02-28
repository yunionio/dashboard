export default {
  created () {
    this.singleActions = [
      {
        label: '关联主机',
        action: obj => {
          this.createDialog('AttachGpuDialog', {
            data: [obj],
            columns: this.columns,
            refresh: this.refresh,
          })
        },
        meta: obj => {
          return {
            validate: !obj.guest_id,
          }
        },
      },
      {
        label: '取消关联主机',
        action: obj => {
          this.createDialog('DetachGpuDialog', {
            data: [obj],
            columns: this.columns,
            refresh: this.refresh,
          })
        },
        meta: obj => {
          if (!obj.guest_id) {
            return {
              validate: false,
              tooltip: '请选择已关联主机的GPU卡',
            }
          }
          if (obj.guest_status !== 'ready') {
            return {
              validate: false,
              tooltip: '关联主机在【关机】的状态下支持该操作',
            }
          }
          return {
            validate: true,
          }
        },
      },
    ]
  },
}
