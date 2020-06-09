import { mapGetters } from 'vuex'

export default {
  computed: mapGetters(['isAdminMode']),
  created () {
    this.singleActions = [
      {
        label: '修改',
        permission: 'scheduledtasks_update',
        action: (obj) => {
          this.createDialog('ScheduledtaskEditDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: () => {
          return {
            validate: true,
            tooltip: '',
          }
        },
      },
      {
        label: '更多',
        actions: () => {
          return [
            {
              label: '启用',
              permission: 'scheduledtasks_perform_enable',
              action: (obj) => {
                this.createDialog('ScheduledtaskEnabledDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                })
              },
              meta: (obj) => {
                return {
                  validate: !obj.enabled,
                  tooltip: obj.enabled ? '请选择已禁用的定时任务' : '',
                }
              },
            },
            {
              label: '禁用',
              permission: 'scheduledtasks_perform_disable',
              action: (obj) => {
                this.createDialog('ScheduledtaskDisabledDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                })
              },
              meta: (obj) => {
                return {
                  validate: obj.enabled,
                  tooltip: !obj.enabled ? '请选择已启用的定时任务' : '',
                }
              },
            },
            {
              label: '删除',
              permission: 'scheduledtasks_delete',
              action: obj => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: '删除',
                  onManager: this.onManager,
                  success: () => {
                    this.destroySidePages()
                  },
                })
              },
              meta: (obj) => this.$getDeleteResult(obj),
            },
          ]
        },
      },
    ]
  },
}
