import {
  getSetPublicAction,
  getEnabledSwitchActions,
} from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('aice.mounted_apps.auto_cache.enable'),
        permission: 'llm_instant_models_perform_enable_auto_cache',
        action: (obj) => {
          this.createDialog('InstantAppAutoCacheDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: (obj) => {
          const ret = { validate: true, tooltip: null }
          if (!obj.enabled) {
            ret.validate = false
            return ret
          }
          return ret
        },
      },
      {
        label: this.$t('cloudenv.text_311'),
        actions: obj => {
          return [
            getSetPublicAction(this, {
              name: this.$t('aice.mounted_apps'),
              scope: 'project',
              resource: 'llm_instant_models',
            }, {
              permission: 'llm_instant_models_perform_public,llm_instant_models_perform_private',
            }),
            // {
            //   label: this.$t('table.action.modify'),
            //   action: obj => {
            //     this.createDialog('LlmImageUpdateDialog', {
            //       vm: this,
            //       data: [obj],
            //       columns: this.columns,
            //       title: this.$t('table.action.update'),
            //       name: this.$t('aice.mounted_apps'),
            //       onManager: this.onManager,
            //     })
            //   },
            //   meta: obj => {
            //     const ret = {
            //       validate: obj.can_update,
            //     }
            //     return ret
            //   },
            // },
            ...getEnabledSwitchActions(this, obj, ['llm_instant_models_perform_enable', 'llm_instant_models_perform_disable'], {
              metas: [
                () => {
                  const ret = {
                    validate: !obj.enabled,
                  }
                  return ret
                },
                () => {
                  const ret = {
                    validate: obj.enabled,
                  }
                  return ret
                },
              ],
              resourceName: this.$t('aice.mounted_apps'),
            }),
            // 同步状态
            {
              label: this.$t('aice.perform_sync_status'),
              action: (obj) => {
                this.onManager('batchPerformAction', {
                  steadyStatus: ['active'],
                  id: [obj.id],
                  managerArgs: {
                    action: 'syncstatus',
                  },
                })
              },
            },
            // 更改项目
            {
              label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
              permission: 'llm_instant_models_perform_public',
              action: (obj) => {
                this.createDialog('ChangeOwenrDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  resource: 'llm_instant_models',
                })
              },
            },
            {
              label: this.$t('table.action.delete'),
              action: obj => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: this.$t('table.action.delete'),
                  name: this.$t('aice.mounted_apps'),
                  onManager: this.onManager,
                })
              },
              meta: obj => this.$getDeleteResult(obj),
            },
          ]
        },
      },
    ]
  },
}
