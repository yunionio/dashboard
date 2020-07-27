import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('compute.text_983'),
        permission: 'skus_create',
        action: obj => {
          this.createDialog('CloneSkuUpdateDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: obj => {
          let tooltip
          if (!obj.enabled) tooltip = i18n.t('compute.text_1057')
          return {
            validate: obj.enabled,
            tooltip,
          }
        },
      },
      {
        label: i18n.t('compute.text_352'),
        actions: obj => {
          return [
            ...getEnabledSwitchActions(this, obj, 'skus_update', 'skus_update'),
            {
              label: i18n.t('compute.text_261'),
              permission: 'skus_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('compute.text_261'),
                  name: this.$t('dictionary.sku'),
                  onManager: this.onManager,
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
