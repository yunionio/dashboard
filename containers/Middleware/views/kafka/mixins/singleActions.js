import { disableDeleteAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('middleware.syncstatus'),
        permission: 'kafkas_perform_syncstatus',
        action: obj => {
          this.onManager('performAction', {
            steadyStatus: ['available'],
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
        label: i18n.t('middleware.more'),
        actions: (obj) => {
          return [
            disableDeleteAction(Object.assign(this, {
              permission: 'kafkas_update',
            }), {
              name: this.$t('dictionary.kafka'),
            }),
            {
              label: i18n.t('middleware.delete'),
              permission: 'kafkas_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: i18n.t('middleware.delete'),
                  name: this.$t('dictionary.kafka'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => this.$getDeleteResult(obj),
            },
          ]
        },
      },
    ]
  },
}
