export default {
  created () {
    this.singleActions = [
      {
        label: `关联${this.$t('dictionary.server')}`,
        action: obj => {
          this.createDialog('AttachGpuDialog', {
            data: [obj],
            title: `关联${this.$t('dictionary.server')}`,
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
        label: `取消关联${this.$t('dictionary.server')}`,
        action: obj => {
          this.createDialog('DetachGpuDialog', {
            data: [obj],
            title: `取消关联${this.$t('dictionary.server')}`,
            columns: this.columns,
            refresh: this.refresh,
          })
        },
        meta: obj => {
          if (!obj.guest_id) {
            return {
              validate: false,
              tooltip: `请选择已关联${this.$t('dictionary.server')}的GPU卡`,
            }
          }
          if (obj.guest_status !== 'ready') {
            return {
              validate: false,
              tooltip: `关联${this.$t('dictionary.server')}在【关机】的状态下支持该操作`,
            }
          }
          return {
            validate: true,
          }
        },
      },
      {
        label: '设置预留资源',
        action: obj => {
          this.createDialog('SetReserveResourceDialog', {
            onManager: this.onManager,
            data: [obj],
            columns: this.columns,
            refresh: this.refresh,
          })
        },
      },
    ]
  },
}
