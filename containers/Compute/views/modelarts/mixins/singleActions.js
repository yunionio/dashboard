import { disableDeleteAction } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('compute.perform_sync_status'),
        action: obj => {
          this.onManager('performAction', {
            steadyStatus: ['ready'],
            id: obj.id,
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
        meta: () => ({
          validate: true,
        }),
      },
      {
        label: this.$t('compute.text_352'),
        actions: obj => {
          return [
            {
              label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  name: 'ModelArts',
                  resource: 'modelarts_pools',
                })
              },
              meta: () => {
                const ret = {
                  validate: false,
                  tooltip: null,
                }
                ret.validate = true
                return ret
              },
            },
            disableDeleteAction(this, {
              name: 'ModelArts',
              meta: () => {
                const ret = { validate: true }
                return ret
              },
            }),
            {
              label: this.$t('table.action.delete'),
              action: obj => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: this.$t('table.action.delete'),
                  name: 'ModelArts',
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
