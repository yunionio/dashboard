import { mapGetters } from 'vuex'

export default {
  computed: mapGetters(['isAdminMode']),
  created () {
    this.singleActions = [
      {
        label: '更改所属',
        action: obj => {
          this.createDialog('SetOwnerDialog', {
            data: [obj],
            columns: this.columns,
            title: '更改所属',
            tipName: '调度标签',
            onManager: this.onManager,
            tipname: this.$t('dictionary.schedtag'),
          })
        },
        meta: () => {
          const ret = {
            validate: true,
            tooltip: null,
          }
          if (!this.isAdminMode) {
            ret.validate = false
          }
          return ret
        },
      },
      {
        label: '偏好设置',
        action: obj => {
          this.createDialog('SetStrategyDialog', {
            data: [obj],
            columns: this.columns,
            title: '偏好设置',
            onManager: this.onManager,
          })
        },
        meta: () => {
          const ret = {
            validate: true,
            tooltip: null,
          }
          if (!this.isAdminMode) {
            ret.validate = false
          }
          return ret
        },
      },
      {
        label: '删除',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: '删除',
            name: this.$t('dictionary.schedtag'),
            onManager: this.onManager,
            success: () => {
              this.destroySidePages()
            },
          })
        },
        meta: obj => {
          const ret = {
            validate: obj.can_delete,
            tooltip: null,
          }
          if (!this.isAdminMode) {
            ret.validate = false
          }
          return ret
        },
      },
    ]
  },
}
